package ridemanagement.backend.dto;

import java.util.List;

public class RideRequestDTO {

    private String startAddress;
    private List<String> stops;
    private String destinationAddress;
    private String vehicleType;
    private boolean carriesBabies;
    private boolean carriesPets;
    private List<String> passengers;
    private List<String> splitFareEmails;

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

    public List<String> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<String> passengers) {
        this.passengers = passengers;
    }

    public List<String> getSplitFareEmails() {
        return splitFareEmails;
    }

    public void setSplitFareEmails(List<String> splitFareEmails) {
        this.splitFareEmails = splitFareEmails;
    }
}
