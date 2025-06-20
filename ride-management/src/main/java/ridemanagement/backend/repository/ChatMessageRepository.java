package ridemanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ridemanagement.backend.model.ChatMessage;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatSessionIdOrderByTimestampAsc(String chatSessionId);

    @Query("SELECT DISTINCT cm.chatSessionId FROM ChatMessage cm")
    List<String> findAllUniqueChatSessionIds();

    @Query("SELECT cm.chatSessionId FROM ChatMessage cm WHERE (cm.sender.id = :userId OR cm.recipient.id = :userId) ORDER BY cm.timestamp DESC")
    List<String> findUniqueChatSessionIdsByUserId(Long userId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatSessionId = :chatSessionId ORDER BY cm.timestamp DESC LIMIT 1")
    ChatMessage findLastMessageByChatSessionId(String chatSessionId);
}