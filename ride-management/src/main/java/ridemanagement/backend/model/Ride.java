package ridemanagement.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_address")
    private String startAddress;

    @ElementCollection
    @CollectionTable(name = "ride_stops", joinColumns = @JoinColumn(name = "ride_id"))
    @Column(name = "stop")
    private List<String> stops;

    @Column(name = "destination_address")
    private String destinationAddress;

    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "start_location_id")
    private Point startLocation;

    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "destination_location_id")
    private Point destinationLocation;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(
            name = "ride_stop_locations",
            joinColumns = @JoinColumn(name = "ride_id"),
            inverseJoinColumns = @JoinColumn(name = "point_id")
    )
    private List<Point> stopLocations;


    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "carries_babies")
    private boolean carriesBabies;

    @Column(name = "carries_pets")
    private boolean carriesPets;

    @ElementCollection
    @CollectionTable(name = "ride_passengers", joinColumns = @JoinColumn(name = "ride_id"))
    @Column(name = "passenger_email")
    private List<String> passengers;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "full_price")
    private double fullPrice;

    @Column(name = "requestor_email")
    private String requestorEmail;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "ride_status")
    private String rideStatus;

    @Column(name = "expected_time")
    private Integer expectedTime;

    @Column(name = "total_length")
    private Double totalLength;

    @Column(name = "driver_id")
    private Long driverId;

    @ElementCollection
    @CollectionTable(name = "ride_refused_drivers", joinColumns = @JoinColumn(name = "ride_id"))
    @Column(name = "driver_id")
    private Set<Long> refusedDriverIds = new HashSet<>();


    public Ride() {
        this.createdAt = LocalDateTime.now();
    }

    public Ride(ridemanagement.backend.dto.RideRequestDTO rideRequestDTO) {
        this();
        this.startAddress = rideRequestDTO.getStartAddress();
        this.stops = rideRequestDTO.getStops();
        this.destinationAddress = rideRequestDTO.getDestinationAddress();
        this.vehicleType = rideRequestDTO.getVehicleType();
        this.carriesBabies = rideRequestDTO.isCarriesBabies();
        this.carriesPets = rideRequestDTO.isCarriesPets();
        this.passengers = rideRequestDTO.getPassengers();
        this.paymentStatus = rideRequestDTO.getPaymentStatus();
        this.fullPrice = rideRequestDTO.getFullPrice();
        this.requestorEmail = rideRequestDTO.getRequestorEmail();
        this.rideStatus = "PENDING";
        this.totalLength = rideRequestDTO.getTotalLength();
        this.expectedTime = rideRequestDTO.getExpectedTime();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStartAddress() { return startAddress; }
    public void setStartAddress(String startAddress) { this.startAddress = startAddress; }

    public List<String> getStops() { return stops; }
    public void setStops(List<String> stops) { this.stops = stops; }

    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }

    public Point getStartLocation() { return startLocation; }
    public void setStartLocation(Point startLocation) { this.startLocation = startLocation; }

    public Point getDestinationLocation() { return destinationLocation; }
    public void setDestinationLocation(Point destinationLocation) { this.destinationLocation = destinationLocation; }

    public List<Point> getStopLocations() { return stopLocations; }
    public void setStopLocations(List<Point> stopLocations) { this.stopLocations = stopLocations; }


    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public boolean isCarriesBabies() { return carriesBabies; }
    public void setCarriesBabies(boolean carriesBabies) { this.carriesBabies = carriesBabies; }

    public boolean isCarriesPets() { return carriesPets; }
    public void setCarriesPets(boolean carriesPets) { this.carriesPets = carriesPets; }

    public List<String> getPassengers() { return passengers; }
    public void setPassengers(List<String> passengers) { this.passengers = passengers; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public double getFullPrice() { return fullPrice; }
    public void setFullPrice(double fullPrice) { this.fullPrice = fullPrice; }

    public String getRequestorEmail() { return requestorEmail; }
    public void setRequestorEmail(String requestorEmail) { this.requestorEmail = requestorEmail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getRideStatus() { return rideStatus; }
    public void setRideStatus(String rideStatus) { this.rideStatus = rideStatus; }

    public Integer getExpectedTime() { return expectedTime; }
    public void setExpectedTime(Integer expectedTime) { this.expectedTime = expectedTime; }

    public Double getTotalLength() { return totalLength; }
    public void setTotalLength(Double totalLength) { this.totalLength = totalLength; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public Set<Long> getRefusedDriverIds() { return refusedDriverIds; }
    public void setRefusedDriverIds(Set<Long> refusedDriverIds) { this.refusedDriverIds = refusedDriverIds; }
    public void addRefusedDriver(Long driverId) { this.refusedDriverIds.add(driverId); }

    @Override
    public String toString() {
        return "Ride{" +
                "id=" + id +
                ", startAddress='" + startAddress + '\'' +
                ", stops=" + stops +
                ", destinationAddress='" + destinationAddress + '\'' +
                ", startLocation=" + startLocation +
                ", destinationLocation=" + destinationLocation +
                ", stopLocations=" + stopLocations +
                ", vehicleType='" + vehicleType + '\'' +
                ", carriesBabies=" + carriesBabies +
                ", carriesPets=" + carriesPets +
                ", passengers=" + passengers +
                ", paymentStatus='" + paymentStatus + '\'' +
                ", fullPrice=" + fullPrice +
                ", requestorEmail='" + requestorEmail + '\'' +
                ", createdAt=" + createdAt +
                ", rideStatus='" + rideStatus + '\'' +
                ", expectedTime=" + expectedTime +
                ", totalLength=" + totalLength +
                ", driverId=" + driverId +
                ", refusedDriverIds=" + refusedDriverIds +
                '}';
    }
}