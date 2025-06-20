// ridemanagement.backend.controller.ChatMessageController
package ridemanagement.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ridemanagement.backend.dto.ChatMessageDTO;
import ridemanagement.backend.model.ChatMessage;
import ridemanagement.backend.repository.ChatMessageRepository;
import com.rideapp.usermanagement.model.User;
import com.rideapp.usermanagement.repository.UserRepository;

import java.security.Principal; // Dodaj import za Principal
import java.util.Optional;
import java.util.UUID;
import java.util.Date;

@Controller
public class ChatMessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatMessageController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO chatMessageDTO, Principal principal) { // Dodaj Principal
        // Loguj principal, da vidiš šta Spring Security koristi kao username/ID
        if (principal != null) {
            System.out.println("DEBUG: Principal Name (Authenticated User Sending Message): " + principal.getName());
        } else {
            System.out.println("DEBUG: No Principal found for the current WebSocket session.");
        }

        Optional<User> senderOptional = userRepository.findById(chatMessageDTO.getSenderId());
        if (senderOptional.isEmpty()) {
            System.err.println("Sender not found for ID: " + chatMessageDTO.getSenderId());
            return;
        }
        User sender = senderOptional.get();

        if (chatMessageDTO.getChatSessionId() == null || chatMessageDTO.getChatSessionId().isEmpty()) {
            chatMessageDTO.setChatSessionId(UUID.randomUUID().toString());
        }
        chatMessageDTO.setTimestamp(new Date());
        chatMessageDTO.setSenderEmail(sender.getEmail());

        ChatMessage chatMessage = new ChatMessage(sender, chatMessageDTO.getMessageContent(), chatMessageDTO.getChatSessionId());
        chatMessageRepository.save(chatMessage);

        System.out.println("DEBUG: Message saved from " + chatMessageDTO.getSenderEmail() +
                " in session " + chatMessageDTO.getChatSessionId() +
                ": " + chatMessageDTO.getMessageContent());

        // Loguj recipientId i senderId za svaki slučaj
        System.out.println("DEBUG: Message Sender ID: " + chatMessageDTO.getSenderId());
        System.out.println("DEBUG: Message Recipient ID: " + chatMessageDTO.getRecipientId());


        // 1. Ako postoji recipientId, šalji poruku direktno tom korisniku
        if (chatMessageDTO.getRecipientId() != null) {
            Optional<User> recipientOptional = userRepository.findById(chatMessageDTO.getRecipientId());
            if (recipientOptional.isPresent()) {
                String recipientPrincipalName = String.valueOf(recipientOptional.get().getId()); // Predpostavljamo da je ID principal name
                // ILI: recipientPrincipalName = recipientOptional.get().getEmail(); // Ako je email principal name
                System.out.println("DEBUG: Sending private message to user with Principal Name: " + recipientPrincipalName + " (Recipient ID: " + chatMessageDTO.getRecipientId() + ")");
                messagingTemplate.convertAndSendToUser(
                        recipientPrincipalName, // Koristi Principal ime primaoca
                        "/queue/messages",
                        chatMessageDTO
                );
            } else {
                System.err.println("Recipient not found for ID: " + chatMessageDTO.getRecipientId());
            }
        }

        // 2. Uvek šalji poruku na admin topic (ovo već radi)
        messagingTemplate.convertAndSend("/topic/admin/chat", chatMessageDTO);
    }
}