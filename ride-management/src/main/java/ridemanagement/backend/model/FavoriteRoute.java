package ridemanagement.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "favorite_routes")
public class FavoriteRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String startAddress;

    @ElementCollection
    @CollectionTable(name = "favorite_route_stops", joinColumns = @JoinColumn(name = "favorite_route_id"))
    @Column(name = "stop_address")
    private List<String> stops;

    @Column(nullable = false)
    private String destinationAddress;

    @ManyToOne
    @JoinColumn(name = "start_location_id", referencedColumnName = "id")
    private Point startLocation;

    @ManyToMany
    @JoinTable(
            name = "favorite_route_stop_locations",
            joinColumns = @JoinColumn(name = "favorite_route_id"),
            inverseJoinColumns = @JoinColumn(name = "point_id")
    )
    private List<Point> stopLocations;

    @ManyToOne
    @JoinColumn(name = "destination_location_id", referencedColumnName = "id")
    private Point destinationLocation;

    private String vehicleType;
    private boolean carriesBabies;
    private boolean carriesPets;

    public FavoriteRoute() {}

    public FavoriteRoute(String userEmail, String startAddress, List<String> stops, String destinationAddress,
                         Point startLocation, List<Point> stopLocations, Point destinationLocation,
                         String vehicleType, boolean carriesBabies, boolean carriesPets) {
        this.userEmail = userEmail;
        this.startAddress = startAddress;
        this.stops = stops;
        this.destinationAddress = destinationAddress;
        this.startLocation = startLocation;
        this.stopLocations = stopLocations;
        this.destinationLocation = destinationLocation;
        this.vehicleType = vehicleType;
        this.carriesBabies = carriesBabies;
        this.carriesPets = carriesPets;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getStartAddress() {
        return startAddress;
    }

    public void setStartAddress(String startAddress) {
        this.startAddress = startAddress;
    }

    public List<String> getStops() {
        return stops;
    }

    public void setStops(List<String> stops) {
        this.stops = stops;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }

    public Point getStartLocation() {
        return startLocation;
    }

    public void setStartLocation(Point startLocation) {
        this.startLocation = startLocation;
    }

    public List<Point> getStopLocations() {
        return stopLocations;
    }

    public void setStopLocations(List<Point> stopLocations) {
        this.stopLocations = stopLocations;
    }

    public Point getDestinationLocation() {
        return destinationLocation;
    }

    public void setDestinationLocation(Point destinationLocation) {
        this.destinationLocation = destinationLocation;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public boolean isCarriesBabies() {
        return carriesBabies;
    }

    public void setCarriesBabies(boolean carriesBabies) {
        this.carriesBabies = carriesBabies;
    }

    public boolean isCarriesPets() {
        return carriesPets;
    }

    public void setCarriesPets(boolean carriesPets) {
        this.carriesPets = carriesPets;
    }
}