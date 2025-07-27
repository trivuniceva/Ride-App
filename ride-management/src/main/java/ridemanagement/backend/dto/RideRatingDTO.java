package ridemanagement.backend.dto;

public class RideRatingDTO {
    private Long rideId;
    private Long reviewerUserId;
    private Long driverId;
    private Long vehicleId;
    private Integer driverRating;
    private Integer vehicleRating;
    private String comment;

    public RideRatingDTO() {
    }

    public RideRatingDTO(Long rideId, Long reviewerUserId, Long driverId, Long vehicleId, Integer driverRating, Integer vehicleRating, String comment) {
        this.rideId = rideId;
        this.reviewerUserId = reviewerUserId;
        this.driverId = driverId;
        this.vehicleId = vehicleId;
        this.driverRating = driverRating;
        this.vehicleRating = vehicleRating;
        this.comment = comment;
    }


    public Long getRideId() {
        return rideId;
    }

    public void setRideId(Long rideId) {
        this.rideId = rideId;
    }

    public Long getReviewerUserId() {
        return reviewerUserId;
    }

    public void setReviewerUserId(Long reviewerUserId) {
        this.reviewerUserId = reviewerUserId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Integer getDriverRating() {
        return driverRating;
    }

    public void setDriverRating(Integer driverRating) {
        this.driverRating = driverRating;
    }

    public Integer getVehicleRating() {
        return vehicleRating;
    }

    public void setVehicleRating(Integer vehicleRating) {
        this.vehicleRating = vehicleRating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}