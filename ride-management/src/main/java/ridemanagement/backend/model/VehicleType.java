package ridemanagement.backend.model;

public enum VehicleType {
    STANDARD(120),
    LUXURY(240),
    VAN(180);

    private final int price;

    VehicleType(int price) {
        this.price = price;
    }

    public int getPrice() {
        return price;
    }
}

