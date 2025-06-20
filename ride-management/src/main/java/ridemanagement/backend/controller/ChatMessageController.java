package ridemanagement.backend.controller;

import com.rideapp.usermanagement.model.User;
import com.rideapp.usermanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ridemanagement.backend.dto.ChatMessageDTO;
import ridemanagement.backend.dto.ChatSessionDetailDTO;
import ridemanagement.backend.model.ChatMessage;
import ridemanagement.backend.repository.ChatMessageRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api/chat")
public class ChatMessageController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/messages/{chatSessionId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatMessagesBySessionId(@PathVariable String chatSessionId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatSessionIdOrderByTimestampAsc(chatSessionId);
        List<ChatMessageDTO> dtos = messages.stream()
                .map(msg -> {
                    ChatMessageDTO dto = new ChatMessageDTO();
                    dto.setChatSessionId(msg.getChatSessionId());
                    dto.setMessageContent(msg.getMessageContent());
                    dto.setSenderId(msg.getSender().getId());
                    dto.setSenderEmail(msg.getSender().getEmail());
                    dto.setTimestamp(msg.getTimestamp());
                    dto.setRecipientId(msg.getRecipient() != null ? msg.getRecipient().getId() : null);
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<String>> getAllChatSessions() {
        List<String> sessionIds = chatMessageRepository.findAllUniqueChatSessionIds();
        return ResponseEntity.ok(sessionIds);
    }

    @GetMapping("/session-details")
    public ResponseEntity<List<ChatSessionDetailDTO>> getAllChatSessionDetails() {
        List<String> sessionIds = chatMessageRepository.findAllUniqueChatSessionIds();
        List<ChatSessionDetailDTO> details = sessionIds.stream()
                .map(sessionId -> {
                    ChatMessage lastMessage = chatMessageRepository.findLastMessageByChatSessionId(sessionId);
                    if (lastMessage != null) {
                        return new ChatSessionDetailDTO(
                                sessionId,
                                lastMessage.getMessageContent(),
                                lastMessage.getSender().getEmail(),
                                lastMessage.getTimestamp(),
                                lastMessage.getSender().getId()
                        );
                    }
                    return null;
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        details.sort((d1, d2) -> d2.getTimestamp().compareTo(d1.getTimestamp()));

        return ResponseEntity.ok(details);
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO chatMessageDTO, SimpMessageHeaderAccessor headerAccessor) {
        Optional<User> senderOpt = userRepository.findById(chatMessageDTO.getSenderId());
        if (senderOpt.isEmpty()) {
            System.err.println("Sender not found for ID: " + chatMessageDTO.getSenderId());
            return;
        }
        User sender = senderOpt.get();

        User recipient = null;
        if (chatMessageDTO.getRecipientId() != null) {
            Optional<User> recipientOpt = userRepository.findById(chatMessageDTO.getRecipientId());
            if (recipientOpt.isPresent()) {
                recipient = recipientOpt.get();
            } else {
                System.err.println("Recipient not found for ID: " + chatMessageDTO.getRecipientId());
            }
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSender(sender);
        chatMessage.setRecipient(recipient);
        chatMessage.setMessageContent(chatMessageDTO.getMessageContent());
        chatMessage.setChatSessionId(chatMessageDTO.getChatSessionId());
        chatMessage.setTimestamp(LocalDateTime.now());

        chatMessageRepository.save(chatMessage);

        ChatMessageDTO responseDto = new ChatMessageDTO(
                chatMessage.getSender().getId(),
                chatMessage.getSender().getEmail(),
                chatMessage.getRecipient() != null ? chatMessage.getRecipient().getId() : null,
                chatMessage.getMessageContent(),
                chatMessage.getChatSessionId(),
                chatMessage.getTimestamp()
        );

        messagingTemplate.convertAndSend("/topic/admin/chat", responseDto);

        messagingTemplate.convertAndSendToUser(
                sender.getEmail(),
                "/queue/messages",
                responseDto
        );

        if (recipient != null && !recipient.getUserRole().equals("ADMINISTRATOR")) {
            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/messages",
                    responseDto
            );
        }
    }
}