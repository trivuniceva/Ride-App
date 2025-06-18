package ridemanagement.backend.dto;

public class NotificationDTO {
    private String type;
    private String message;
    private RideRequestDTO rideRequest;
    private Long rideId;

    public NotificationDTO(String type, String message, RideRequestDTO rideRequest, Long rideId) {
        this.type = type;
        this.message = message;
        this.rideRequest = rideRequest;
        this.rideId = rideId;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public RideRequestDTO getRideRequest() { return rideRequest; }
    public void setRideRequest(RideRequestDTO rideRequest) { this.rideRequest = rideRequest; }
    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }
}