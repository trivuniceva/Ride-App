package ridemanagement.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rideapp.usermanagement.model.User;
import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "drivers")
public class Driver extends User {

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    @JsonIgnore
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    @JsonIgnore
    private Point location;

    @Column(name = "time_of_login")
    private Timestamp timeOfLogin;

    @Column(name = "has_future_drive", columnDefinition = "boolean default false")
    private Boolean hasFutureDrive;


    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public Point getLocation() {
        return location;
    }

    public void setLocation(Point location) {
        this.location = location;
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

    @Override
    public String toString() {
        return "Driver{" +
                "isAvailable=" + isAvailable +
                ", vehicle=" + vehicle +
                ", location=" + location +
                ", timeOfLogin=" + timeOfLogin +
                ", hasFutureDrive=" + hasFutureDrive +
                '}';
    }
}
