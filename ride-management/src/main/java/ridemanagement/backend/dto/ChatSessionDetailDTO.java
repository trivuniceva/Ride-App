package ridemanagement.backend.dto;

import java.time.LocalDateTime;

public class ChatSessionDetailDTO {
    private String sessionId;
    private String lastMessageContent;
    private String lastSenderEmail;
    private LocalDateTime timestamp;
    private Long lastSenderId;

    public ChatSessionDetailDTO() {
    }

    public ChatSessionDetailDTO(String sessionId, String lastMessageContent, String lastSenderEmail, LocalDateTime timestamp, Long lastSenderId) {
        this.sessionId = sessionId;
        this.lastMessageContent = lastMessageContent;
        this.lastSenderEmail = lastSenderEmail;
        this.timestamp = timestamp;
        this.lastSenderId = lastSenderId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getLastMessageContent() {
        return lastMessageContent;
    }

    public void setLastMessageContent(String lastMessageContent) {
        this.lastMessageContent = lastMessageContent;
    }

    public String getLastSenderEmail() {
        return lastSenderEmail;
    }

    public void setLastSenderEmail(String lastSenderEmail) {
        this.lastSenderEmail = lastSenderEmail;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Long getLastSenderId() {
        return lastSenderId;
    }

    public void setLastSenderId(Long lastSenderId) {
        this.lastSenderId = lastSenderId;
    }
}