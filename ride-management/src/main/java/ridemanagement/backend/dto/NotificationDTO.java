package ridemanagement.backend.dto;

public class NotificationDTO {
    private String type;
    private String message;
    private RideRequestDTO rideRequestDTO;
    private Long rideId;
    private Long driverId;
    private String driverFirstname;
    private String driverLastname;
    private String driverPictureUrl;
    private Long userId;

    public NotificationDTO() {
    }

    public NotificationDTO(String type, String message, RideRequestDTO rideRequestDTO, Long rideId, Long driverId) {
        this.type = type;
        this.message = message;
        this.rideId = rideId;
        this.driverId = driverId;
    }

    public NotificationDTO(String type, String message, Long rideId, Long userId, String driverFirstname, String driverLastname, String driverPictureUrl) {
        this.type = type;
        this.message = message;
        this.rideId = rideId;
        this.userId = userId;
        this.driverFirstname = driverFirstname;
        this.driverLastname = driverLastname;
        this.driverPictureUrl = driverPictureUrl;
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

    public String getDriverFirstname() {
        return driverFirstname;
    }

    public void setDriverFirstname(String driverFirstname) {
        this.driverFirstname = driverFirstname;
    }

    public String getDriverLastname() {
        return driverLastname;
    }

    public void setDriverLastname(String driverLastname) {
        this.driverLastname = driverLastname;
    }

    public String getDriverPictureUrl() {
        return driverPictureUrl;
    }

    public void setDriverPictureUrl(String driverPictureUrl) {
        this.driverPictureUrl = driverPictureUrl;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}