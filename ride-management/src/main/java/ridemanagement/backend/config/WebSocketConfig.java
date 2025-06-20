package ridemanagement.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/websocket-chat") // <-- THIS MUST MATCH
                .setAllowedOrigins("http://localhost:4200") // <-- CRUCIAL FOR CORS (use your Angular port)
                .withSockJS(); // Usually needed for browser compatibility
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue", "/user"); // Enable /topic for public, /queue for private, /user for user-specific
        config.setApplicationDestinationPrefixes("/app"); // Prefix for messages from client to server (e.g., /app/chat.sendMessage)
    }
}