package ridemanagement.backend.dto;

import ridemanagement.backend.model.Point;

import java.sql.Timestamp;

public class DriverDTO {
    private Long id;
    private String email;
    private String firstname;
    private String lastname;
    private boolean isActive;
    private String blockNote;
    private boolean isAvailable;
    private Timestamp timeOfLogin;
    private Boolean hasFutureDrive;
    private PointDTO location;
    private Double averageRating;

    public DriverDTO() {
    }

    // Constructor without blockNote
    public DriverDTO(Long id, String email, String firstname, String lastname, boolean isActive, boolean isAvailable, Timestamp timeOfLogin, Boolean hasFutureDrive, PointDTO location, Double averageRating) {
        this.id = id;
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.isActive = isActive; // From User
        this.isAvailable = isAvailable;
        this.timeOfLogin = timeOfLogin;
        this.hasFutureDrive = hasFutureDrive;
        this.location = location;
        this.averageRating = averageRating;
    }

    // Constructor with blockNote
    public DriverDTO(Long id, String email, String firstname, String lastname, boolean isActive, String blockNote, boolean isAvailable, Timestamp timeOfLogin, Boolean hasFutureDrive, PointDTO location, Double averageRating) {
        this.id = id;
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.isActive = isActive;
        this.blockNote = blockNote;
        this.isAvailable = isAvailable;
        this.timeOfLogin = timeOfLogin;
        this.hasFutureDrive = hasFutureDrive;
        this.location = location;
        this.averageRating = averageRating;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public Timestamp getTimeOfLogin() {
        return timeOfLogin;
    }

    public void setTimeOfLogin(Timestamp timeOfLogin) {
        this.timeOfLogin = timeOfLogin;
    }

    public Boolean getHasFutureDrive() {
        return hasFutureDrive;
    }

    public void setHasFutureDrive(Boolean hasFutureDrive) {
        this.hasFutureDrive = hasFutureDrive;
    }

    public PointDTO getLocation() {
        return location;
    }

    public void setLocation(PointDTO location) {
        this.location = location;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getBlockNote() {
        return blockNote;
    }

    public void setBlockNote(String blockNote) {
        this.blockNote = blockNote;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    @Override
    public String toString() {
        return "DriverDTO{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", firstname='" + firstname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", isAvailable=" + isAvailable +
                ", timeOfLogin=" + timeOfLogin +
                ", hasFutureDrive=" + hasFutureDrive +
                ", location=" + location +
                '}';
    }
}