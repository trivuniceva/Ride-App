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
        // Tvoj postojeći STOMP endpoint.
        // Klijenti će se povezivati na ws://localhost:8080/websocket-chat
        // Uverite se da je tvoj Angular frontend konfigurisan da se poveže na ovu putanju.
        registry.addEndpoint("/websocket-chat")
                .setAllowedOrigins("http://localhost:4200") // Dozvoljava konekcije sa tvog Angular frontenda
                .withSockJS(); // Omogućava SockJS fallback za starije browsere
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Omogućava jednostavan (in-memory) broker za slanje poruka
        // na destinacije koje počinju sa:
        // - /topic: Za javne poruke (svi pretplatnici dobijaju poruku)
        // - /queue: Za redove (poruke se šalju jednom pretplatniku u redu)
        // - /user: Specijalni prefiks za slanje poruka određenom korisniku
        config.enableSimpleBroker("/topic", "/queue", "/user");

        // Prefiks za destinacije poruka koje klijenti šalju serveru (npr. /app/send-message)
        config.setApplicationDestinationPrefixes("/app");
    }
}