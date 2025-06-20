package ridemanagement.backend.model;

import com.rideapp.usermanagement.model.User;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "message_content", nullable = false, length = 1000)
    private String messageContent;

    @Column(name = "chat_session_id", nullable = false)
    private String chatSessionId;

    @Column(name = "timestamp", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

    @Column(name = "is_read")
    private boolean isRead = false;

    public ChatMessage() {
    }

    public ChatMessage(User sender, String messageContent, String chatSessionId) {
        this.sender = sender;
        this.messageContent = messageContent;
        this.chatSessionId = chatSessionId;
        this.timestamp = new Date();
        this.isRead = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public String getMessageContent() { return messageContent; }
    public void setMessageContent(String messageContent) { this.messageContent = messageContent; }
    public String getChatSessionId() { return chatSessionId; }
    public void setChatSessionId(String chatSessionId) { this.chatSessionId = chatSessionId; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}