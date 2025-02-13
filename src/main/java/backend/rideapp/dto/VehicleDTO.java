package backend.rideapp.dto;

public class VehicleDTO {

    private String registrationNumber;
    private String vehicleName;
    private String vehicleType;

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    @Override
    public String toString() {
        return "VehicleDTO{" +
                "registrationNumber='" + registrationNumber + '\'' +
                ", vehicleName='" + vehicleName + '\'' +
                ", vehicleType='" + vehicleType + '\'' +
                '}';
    }
}
