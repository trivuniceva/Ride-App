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

    public void notifyDriver(Long driverId, String message, RideRequestDTO rideRequestDTO, Long rideId) {
        NotificationDTO notification = new NotificationDTO("RIDE_REQUEST", message, rideRequestDTO, rideId, driverId);
        try {
            String jsonMessage = objectMapper.writeValueAsString(notification);
            messagingTemplate.convertAndSend(
                    "/topic/ride-requests",
                    jsonMessage
            );
            System.out.println("Poslato obaveštenje vozaču " + driverId + " na /topic/ride-requests (TEST)");
        } catch (JsonProcessingException e) {
            System.err.println("Greška prilikom serijalizacije obaveštenja u JSON: " + e.getMessage());
        }
    }

    public void notifyUser(Long userId, String type, String message, Long rideId, String driverFirstname, String driverLastname, String driverPictureUrl) {
        NotificationDTO notification = new NotificationDTO(type, message, rideId, userId, driverFirstname, driverLastname, driverPictureUrl);
        try {
            String jsonMessage = objectMapper.writeValueAsString(notification);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(userId),
                    "/queue/ride-updates",
                    jsonMessage
            );
            System.out.println("Poslato " + type + " obaveštenje korisniku " + userId + " na /user/" + userId + "/queue/ride-updates");
        } catch (JsonProcessingException e) {
            System.err.println("Greška prilikom serijalizacije obaveštenja za korisnika u JSON: " + e.getMessage());
        }
    }
}