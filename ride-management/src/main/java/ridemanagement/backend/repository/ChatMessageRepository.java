package ridemanagement.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ridemanagement.backend.model.ChatMessage;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatSessionIdOrderByTimestampAsc(String chatSessionId);

}