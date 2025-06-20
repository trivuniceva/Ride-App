package com.rideapp.usermanagement.dto;

import com.rideapp.usermanagement.model.UserRole;

public class UserDTO {
    private Long id;
    private String email;
    private String firstname;
    private String lastname;
    private UserRole userRole;
    private String address;
    private String phone;
    private boolean isActive; // Now used for active/blocked status
    private String blockNote; // Note related to the active/blocked status

    public UserDTO() {
    }

    public UserDTO(Long id, String email, String firstname, String lastname, UserRole userRole, String address, String phone, boolean isActive, String blockNote) {
        this.id = id;
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.userRole = userRole;
        this.address = address;
        this.phone = phone;
        this.isActive = isActive;
        this.blockNote = blockNote;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public UserRole getUserRole() {
        return userRole;
    }

    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getBlockNote() {
        return blockNote;
    }

    public void setBlockNote(String blockNote) {
        this.blockNote = blockNote;
    }
}