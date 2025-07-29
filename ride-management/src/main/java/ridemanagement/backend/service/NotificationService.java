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
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(driverId),
                    "/queue/driver-updates",
                    jsonMessage
            );
            System.out.println("Poslato obaveštenje vozaču " + driverId + " o zahtevu za vožnju na /user/" + driverId + "/queue/driver-updates");
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

    public void notifyUserDriverLocation(Long userId, Long rideId, Long driverId, double latitude, double longitude, String notificationType) {
        NotificationDTO notification = new NotificationDTO(
                notificationType,
                "Ažuriranje lokacije vozača",
                rideId,
                userId,
                null,
                null,
                null
        );
        notification.setLatitude(latitude);
        notification.setLongitude(longitude);
        notification.setDriverId(driverId);

        try {
            String jsonMessage = objectMapper.writeValueAsString(notification);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(userId),
                    "/queue/ride-updates",
                    jsonMessage
            );
            System.out.println("Poslato ažuriranje lokacije vozača za vožnju " + rideId + " korisniku " + userId + ": " + latitude + ", " + longitude);
        } catch (JsonProcessingException e) {
            System.err.println("Greška prilikom serijalizacije obaveštenja o lokaciji vozača: " + e.getMessage());
        }
    }

    public void notifyDriverArrivedAtPickup(Long driverId, Long rideId, String message) {
        NotificationDTO notification = new NotificationDTO(
                "DRIVER_ARRIVED_AT_PICKUP_FOR_DRIVER",
                message,
                rideId,
                null,
                null, null, null
        );
        notification.setDriverId(driverId);

        try {
            String jsonMessage = objectMapper.writeValueAsString(notification);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(driverId),
                    "/queue/driver-updates",
                    jsonMessage
            );
            System.out.println("Poslato obaveštenje vozaču " + driverId + " o dolasku na pick-up za vožnju " + rideId);
        } catch (JsonProcessingException e) {
            System.err.println("Greška prilikom serijalizacije obaveštenja za vozača o dolasku na pick-up: " + e.getMessage());
        }
    }
}