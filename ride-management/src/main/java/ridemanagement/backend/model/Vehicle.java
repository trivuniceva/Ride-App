package ridemanagement.backend.model;

import com.rideapp.usermanagement.model.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.Id;


@Entity
@Table(name = "vehicle")
public class Vehicle {

    @jakarta.persistence.Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "driver_id", referencedColumnName = "id")
    private User driver;

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type")
    private VehicleType vehicleType;


    public User getDriver() {
        return driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    @Override
    public String toString() {
        return "Vehicle{" +
                "id=" + id +
                ", driver=" + driver +
                ", registrationNumber='" + registrationNumber + '\'' +
                ", name='" + name + '\'' +
                ", vehicleType=" + vehicleType +
                '}';
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }
}
