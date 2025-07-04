package com.rideapp.usermanagement.dto;

public class UserUpdateRequestDTO {
    private String firstname;
    private String lastname;
    private String address;
    private String phone;

    public UserUpdateRequestDTO() {
    }

    public UserUpdateRequestDTO(String firstname, String lastname, String address, String phone) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.address = address;
        this.phone = phone;
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
}