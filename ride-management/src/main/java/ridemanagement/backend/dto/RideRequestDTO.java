package ridemanagement.backend.dto;

import java.util.List;

public class RideRequestDTO {
    private String startAddress;
    private List<String> stops;
    private String destinationAddress;

    private PointDTO startLocation;
    private List<PointDTO> stopLocations;
    private PointDTO destinationLocation;

    private String vehicleType;
    private boolean carriesBabies;
    private boolean carriesPets;
    private List<String> passengers;
    private String paymentStatus;
    private double fullPrice;
    private String requestorEmail;
    private Double totalLength;
    private Integer expectedTime;

    public RideRequestDTO() {}

    public RideRequestDTO(String startAddress, List<String> stops, String destinationAddress, PointDTO startLocation, List<PointDTO> stopLocations, PointDTO destinationLocation, String vehicleType, boolean carriesBabies, boolean carriesPets, List<String> passengers, String paymentStatus, double fullPrice, String requestorEmail, Double totalLength, Integer expectedTime) {
        this.startAddress = startAddress;
        this.stops = stops;
        this.destinationAddress = destinationAddress;
        this.startLocation = startLocation;
        this.stopLocations = stopLocations;
        this.destinationLocation = destinationLocation;
        this.vehicleType = vehicleType;
        this.carriesBabies = carriesBabies;
        this.carriesPets = carriesPets;
        this.passengers = passengers;
        this.paymentStatus = paymentStatus;
        this.fullPrice = fullPrice;
        this.requestorEmail = requestorEmail;
        this.totalLength = totalLength;
        this.expectedTime = expectedTime;
    }

    public RideRequestDTO(String startAddress, List<String> stops, String destinationAddress, PointDTO startLocation, PointDTO destinationLocation, String vehicleType, boolean carriesBabies, boolean carriesPets, List<String> passengers, double fullPrice, String requestorEmail) {
        this.startAddress = startAddress;
        this.stops = stops;
        this.destinationAddress = destinationAddress;
        this.startLocation = startLocation;
        this.destinationLocation = destinationLocation;
        this.vehicleType = vehicleType;
        this.carriesBabies = carriesBabies;
        this.carriesPets = carriesPets;
        this.passengers = passengers;
        this.fullPrice = fullPrice;
        this.requestorEmail = requestorEmail;
        this.paymentStatus = "PENDING_DRIVER_CONFIRMATION";
        this.totalLength = 0.0;
        this.expectedTime = 0;
    }

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
    public List<String> getPassengers() { return passengers; }
    public void setPassengers(List<String> passengers) { this.passengers = passengers; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public double getFullPrice() { return fullPrice; }
    public void setFullPrice(double fullPrice) { this.fullPrice = fullPrice; }
    public String getRequestorEmail() { return requestorEmail; }
    public void setRequestorEmail(String requestorEmail) { this.requestorEmail = requestorEmail; }
    public Double getTotalLength() { return totalLength; }
    public void setTotalLength(Double totalLength) { this.totalLength = totalLength; }
    public Integer getExpectedTime() { return expectedTime; }
    public void setExpectedTime(Integer expectedTime) { this.expectedTime = expectedTime; }

    @Override
    public String toString() {
        return "RideRequestDTO{" +
                "startAddress='" + startAddress + '\'' +
                ", destinationAddress='" + destinationAddress + '\'' +
                ", fullPrice=" + fullPrice +
                ", requestorEmail='" + requestorEmail + '\'' +
                ", totalLength=" + totalLength +
                ", expectedTime=" + expectedTime +
                '}';
    }
}