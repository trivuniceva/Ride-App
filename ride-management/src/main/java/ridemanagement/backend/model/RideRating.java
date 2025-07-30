package ridemanagement.backend.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "ride_rating")
public class RideRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ride_id", nullable = false)
    private Long rideId;

    @Column(name = "reviewer_user_id", nullable = false)
    private Long reviewerUserId;

    @Column(name = "driver_id", nullable = false)
    private Long driverId;

    // **** PROMENA OVDE: Mapiraj kao ManyToOne vezu sa Vehicle entitetom ****
    @ManyToOne(fetch = FetchType.LAZY) // Uklonjeno cascade = CascadeType.ALL ako je bilo
    @JoinColumn(name = "vehicle_id") // Ovo je kolona u ride_rating tabeli koja je strani ključ
    private Vehicle vehicle; // Sada referenciramo ceo Vehicle objekat

    @Column(name = "driver_rating", nullable = false)
    private Integer driverRating;

    @Column(name = "vehicle_rating", nullable = false)
    private Integer vehicleRating;

    @Column(name = "comment", length = 255)
    private String comment;

    @Column(name = "rating_date")
    private ZonedDateTime ratingDate;

    public RideRating() {
        this.ratingDate = ZonedDateTime.now();
    }

    // **** Ažuriraj konstruktor da prima Vehicle objekat umesto Long vehicleId ****
    public RideRating(Long rideId, Long reviewerUserId, Long driverId, Vehicle vehicle, Integer driverRating, Integer vehicleRating, String comment) {
        this.rideId = rideId;
        this.reviewerUserId = reviewerUserId;
        this.driverId = driverId;
        this.vehicle = vehicle; // Postavi Vehicle objekat
        this.driverRating = driverRating;
        this.vehicleRating = vehicleRating;
        this.comment = comment;
        this.ratingDate = ZonedDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    // **** Ažuriraj getter i setter za Vehicle objekat ****
    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
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

    public ZonedDateTime getRatingDate() {
        return ratingDate;
    }

    public void setRatingDate(ZonedDateTime ratingDate) {
        this.ratingDate = ratingDate;
    }
}
