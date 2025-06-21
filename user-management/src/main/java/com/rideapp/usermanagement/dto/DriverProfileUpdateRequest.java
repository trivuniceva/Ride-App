package com.rideapp.usermanagement.dto;

import com.rideapp.usermanagement.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "driver_profile_update_requests")
public class DriverProfileUpdateRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(name = "old_firstname")
    private String oldFirstname;
    @Column(name = "new_firstname")
    private String newFirstname;

    @Column(name = "old_lastname")
    private String oldLastname;
    @Column(name = "new_lastname")
    private String newLastname;

    @Column(name = "old_address")
    private String oldAddress;
    @Column(name = "new_address")
    private String newAddress;

    @Column(name = "old_phone")
    private String oldPhone;
    @Column(name = "new_phone")
    private String newPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UpdateRequestStatus status;

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    @Column(name = "processed_date")
    private LocalDateTime processedDate;

    public enum UpdateRequestStatus {
        PENDING, APPROVED, REJECTED
    }

    public DriverProfileUpdateRequest() {
        this.status = UpdateRequestStatus.PENDING;
        this.requestDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getDriver() {
        return driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
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

    public UpdateRequestStatus getStatus() {
        return status;
    }

    public void setStatus(UpdateRequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public LocalDateTime getProcessedDate() {
        return processedDate;
    }

    public void setProcessedDate(LocalDateTime processedDate) {
        this.processedDate = processedDate;
    }
}