package ridemanagement.backend.dto;

public class NotificationDTO {
    private String type; // Npr. "RIDE_REQUEST"
    private String message;
    private RideRequestDTO rideRequest; // Opciono, možete poslati ceo rideRequest ako je potrebno

    public NotificationDTO(String type, String message, RideRequestDTO rideRequest) {
        this.type = type;
        this.message = message;
        this.rideRequest = rideRequest;
    }

    // Getteri i setteri
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public RideRequestDTO getRideRequest() {
        return rideRequest;
    }

    public void setRideRequest(RideRequestDTO rideRequest) {
        this.rideRequest = rideRequest;
    }
}