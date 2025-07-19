package ridemanagement.backend.dto;

public class VehicleTypeDto {
    private String type;
    private int price;

    public VehicleTypeDto(String type, int price) {
        this.type = type;
        this.price = price;
    }

    public String getType() {
        return type;
    }

    public int getPrice() {
        return price;
    }
}

