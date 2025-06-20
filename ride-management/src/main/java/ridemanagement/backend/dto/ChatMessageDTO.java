package ridemanagement.backend.dto;

import java.time.LocalDateTime;

public class ChatMessageDTO {
    private Long senderId;
    private String senderEmail;
    private Long recipientId;
    private String messageContent;
    private String chatSessionId;
    private LocalDateTime timestamp;

    public ChatMessageDTO() {
    }

    public ChatMessageDTO(Long senderId, String senderEmail, Long recipientId, String messageContent, String chatSessionId, LocalDateTime timestamp) {
        this.senderId = senderId;
        this.senderEmail = senderEmail;
        this.recipientId = recipientId;
        this.messageContent = messageContent;
        this.chatSessionId = chatSessionId;
        this.timestamp = timestamp;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public void setMessageContent(String messageContent) {
        this.messageContent = messageContent;
    }

    public String getChatSessionId() {
        return chatSessionId;
    }

    public void setChatSessionId(String chatSessionId) {
        this.chatSessionId = chatSessionId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}