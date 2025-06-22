package ridemanagement.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.NotificationDTO;
import ridemanagement.backend.dto.RideRequestDTO;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // NotificationService.java
    public void notifyDriver(Long driverId, String message, RideRequestDTO rideRequestDTO, Long rideId) {
        NotificationDTO notification = new NotificationDTO("RIDE_REQUEST", message, rideRequestDTO, rideId, driverId);

        try {
            String jsonMessage = objectMapper.writeValueAsString(notification);

            // PRIVREMENA PROMENA SAMO ZA TESTIRANJE:
            // messagingTemplate.convertAndSendToUser(
            //         String.valueOf(driverId),
            //         "/queue/messages",
            //         jsonMessage
            // );
            messagingTemplate.convertAndSend(
                    "/topic/ride-requests", // NOVA GENERICKA DESTINACIJA
                    jsonMessage
            );
            System.out.println("Poslato obaveštenje vozaču " + driverId + " na /topic/ride-requests (TEST)");

        } catch (JsonProcessingException e) {
            System.err.println("Greška prilikom serijalizacije obaveštenja u JSON: " + e.getMessage());
        }
    }
}