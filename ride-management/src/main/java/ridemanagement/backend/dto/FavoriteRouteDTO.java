package ridemanagement.backend.dto;

import java.util.List;

public class FavoriteRouteDTO {
    private Long id;
    private String userEmail;
    private String startAddress;
    private List<String> stops;
    private String destinationAddress;
    private PointDTO startLocation;
    private List<PointDTO> stopLocations;
    private PointDTO destinationLocation;
    private String vehicleType;
    private boolean carriesBabies;
    private boolean carriesPets;

    public FavoriteRouteDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getStartAddress() { return startAddress; }
    public void setStartAddress(String startAddress) { this.startAddress = startAddress; }
    public List<String> getStops() { return stops; }
    public void setStops(List<String> stops) { this.stops = stops; }
    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }
    public PointDTO getStartLocation() { return startLocation; }
    public void setStartLocation(PointDTO startLocation) { this.startLocation = startLocation; }
    public List<PointDTO> getStopLocations() { return stopLocations; }
    public void setStopLocations(List<PointDTO> stopLocations) { this.stopLocations = stopLocations; }
    public PointDTO getDestinationLocation() { return destinationLocation; }
    public void setDestinationLocation(PointDTO destinationLocation) { this.destinationLocation = destinationLocation; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public boolean isCarriesBabies() { return carriesBabies; }
    public void setCarriesBabies(boolean carriesBabies) { this.carriesBabies = carriesBabies; }
    public boolean isCarriesPets() { return carriesPets; }
    public void setCarriesPets(boolean carriesPets) { this.carriesPets = carriesPets; }
}