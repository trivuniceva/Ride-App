package ridemanagement.backend.dto;

import java.util.Date;

public class ChatMessageDTO {
    private String chatSessionId;
    private Long senderId;
    private String messageContent;
    private Long recipientId;
    private String senderEmail;
    private Date timestamp;

    public ChatMessageDTO() {}

    public ChatMessageDTO(String chatSessionId, Long senderId, String messageContent, Long recipientId, String senderEmail, Date timestamp) {
        this.chatSessionId = chatSessionId;
        this.senderId = senderId;
        this.messageContent = messageContent;
        this.recipientId = recipientId;
        this.senderEmail = senderEmail;
        this.timestamp = timestamp;
    }

    public String getChatSessionId() {
        return chatSessionId;
    }

    public void setChatSessionId(String chatSessionId) {
        this.chatSessionId = chatSessionId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public void setMessageContent(String messageContent) {
        this.messageContent = messageContent;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }
}