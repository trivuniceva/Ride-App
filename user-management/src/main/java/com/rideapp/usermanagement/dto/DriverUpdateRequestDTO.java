package com.rideapp.usermanagement.dto;

import java.time.LocalDateTime;

public class DriverUpdateRequestDTO {
    private Long requestId;
    private Long driverId;
    private String driverEmail;
    private String oldFirstname;
    private String newFirstname;
    private String oldLastname;
    private String newLastname;
    private String oldAddress;
    private String newAddress;
    private String oldPhone;
    private String newPhone;
    private LocalDateTime requestDate;

    public DriverUpdateRequestDTO() {
    }

    public DriverUpdateRequestDTO(Long requestId, Long driverId, String driverEmail, String oldFirstname, String newFirstname, String oldLastname, String newLastname, String oldAddress, String newAddress, String oldPhone, String newPhone, LocalDateTime requestDate) {
        this.requestId = requestId;
        this.driverId = driverId;
        this.driverEmail = driverEmail;
        this.oldFirstname = oldFirstname;
        this.newFirstname = newFirstname;
        this.oldLastname = oldLastname;
        this.newLastname = newLastname;
        this.oldAddress = oldAddress;
        this.newAddress = newAddress;
        this.oldPhone = oldPhone;
        this.newPhone = newPhone;
        this.requestDate = requestDate;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public String getDriverEmail() {
        return driverEmail;
    }

    public void setDriverEmail(String driverEmail) {
        this.driverEmail = driverEmail;
    }

    public String getOldFirstname() {
        return oldFirstname;
    }

    public void setOldFirstname(String oldFirstname) {
        this.oldFirstname = oldFirstname;
    }

    public String getNewFirstname() {
        return newFirstname;
    }

    public void setNewFirstname(String newFirstname) {
        this.newFirstname = newFirstname;
    }

    public String getOldLastname() {
        return oldLastname;
    }

    public void setOldLastname(String oldLastname) {
        this.oldLastname = oldLastname;
    }

    public String getNewLastname() {
        return newLastname;
    }

    public void setNewLastname(String newLastname) {
        this.newLastname = newLastname;
    }

    public String getOldAddress() {
        return oldAddress;
    }

    public void setOldAddress(String oldAddress) {
        this.oldAddress = oldAddress;
    }

    public String getNewAddress() {
        return newAddress;
    }

    public void setNewAddress(String newAddress) {
        this.newAddress = newAddress;
    }

    public String getOldPhone() {
        return oldPhone;
    }

    public void setOldPhone(String oldPhone) {
        this.oldPhone = oldPhone;
    }

    public String getNewPhone() {
        return newPhone;
    }

    public void setNewPhone(String newPhone) {
        this.newPhone = newPhone;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }
}