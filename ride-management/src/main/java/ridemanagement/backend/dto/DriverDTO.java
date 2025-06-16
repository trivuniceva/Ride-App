package ridemanagement.backend.dto;

import ridemanagement.backend.model.Point;

import java.sql.Timestamp;

public class DriverDTO {
    private Long id;
    private String email;
    private String firstname;
    private String lastname;
    private boolean isBlocked;
    private boolean isAvailable;
    private Timestamp timeOfLogin;
    private Boolean hasFutureDrive;
    private PointDTO location;

    public DriverDTO(Long id, String email, String firstname, String lastname, boolean isBlocked, boolean isAvailable, Timestamp timeOfLogin, Boolean hasFutureDrive, PointDTO location) {
        this.id = id;
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.isBlocked = isBlocked;
        this.isAvailable = isAvailable;
        this.timeOfLogin = timeOfLogin;
        this.hasFutureDrive = hasFutureDrive;
        this.location = location;
    }

    public DriverDTO(Long id, String email, String firstname, String lastname, boolean blocked, boolean available, Timestamp timeOfLogin, Boolean hasFutureDrive, Point location) {
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

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        isBlocked = blocked;
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

    @Override
    public String toString() {
        return "DriverDTO{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", firstname='" + firstname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", isBlocked=" + isBlocked +
                ", isAvailable=" + isAvailable +
                ", timeOfLogin=" + timeOfLogin +
                ", hasFutureDrive=" + hasFutureDrive +
                ", location=" + location +
                '}';
    }
}