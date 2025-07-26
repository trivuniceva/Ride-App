package com.rideapp.usermanagement.model;

public class SuccessResponse {
    private String message;
    private String profilePicPath;

    public SuccessResponse(String message) {
        this.message = message;
        this.profilePicPath = null;
    }

    public SuccessResponse(String message, String profilePicPath) {
        this.message = message;
        this.profilePicPath = profilePicPath;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getProfilePicPath() {
        return profilePicPath;
    }

    public void setProfilePicPath(String profilePicPath) {
        this.profilePicPath = profilePicPath;
    }
}

