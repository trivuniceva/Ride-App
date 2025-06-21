package ridemanagement.backend.dto;

public class NotificationDTO {
    private String type;
    private String message;
    private RideRequestDTO rideRequestDTO;
    private Long rideId;
    private Long driverId;

    public NotificationDTO(String type, String message, RideRequestDTO rideRequestDTO, Long rideId) {
        this.type = type;
        this.message = message;
        this.rideRequestDTO = rideRequestDTO;
        this.rideId = rideId;
    }

    public NotificationDTO(String type, String message, RideRequestDTO rideRequestDTO, Long rideId, Long driverId) {
        this.type = type;
        this.message = message;
        this.rideRequestDTO = rideRequestDTO;
        this.rideId = rideId;
        this.driverId = driverId;
    }

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

    public RideRequestDTO getRideRequestDTO() {
        return rideRequestDTO;
    }

    public void setRideRequestDTO(RideRequestDTO rideRequestDTO) {
        this.rideRequestDTO = rideRequestDTO;
    }

    public Long getRideId() {
        return rideId;
    }

    public void setRideId(Long rideId) {
        this.rideId = rideId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }
}
