// ridemanagement.backend.dto.ChatMessageDTO
package ridemanagement.backend.dto;

import java.util.Date; // Import Date

public class ChatMessageDTO {
    private String chatSessionId;
    private Long senderId;
    private String messageContent;
    private Long recipientId; // Optional, if needed for direct admin targeting
    private String senderEmail; // <-- ADD THIS
    private Date timestamp;     // <-- ADD THIS

    // Constructor(s)
    public ChatMessageDTO() {}

    public ChatMessageDTO(String chatSessionId, Long senderId, String messageContent, Long recipientId, String senderEmail, Date timestamp) {
        this.chatSessionId = chatSessionId;
        this.senderId = senderId;
        this.messageContent = messageContent;
        this.recipientId = recipientId;
        this.senderEmail = senderEmail; // Initialize senderEmail
        this.timestamp = timestamp;     // Initialize timestamp
    }

    // Getters
    public String getChatSessionId() { return chatSessionId; }
    public Long getSenderId() { return senderId; }
    public String getMessageContent() { return messageContent; }
    public Long getRecipientId() { return recipientId; }
    public String getSenderEmail() { return senderEmail; } // Getter for senderEmail
    public Date getTimestamp() { return timestamp; }       // Getter for timestamp

    // Setters
    public void setChatSessionId(String chatSessionId) { this.chatSessionId = chatSessionId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public void setMessageContent(String messageContent) { this.messageContent = messageContent; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; } // Setter for senderEmail
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }       // Setter for timestamp
}