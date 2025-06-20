package com.rideapp.usermanagement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public class BlockUserRequestDTO {
    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotNull(message = "Blocked status cannot be null")
    private Boolean isBlocked;

    @Size(max = 500, message = "Block note cannot exceed 500 characters")
    private String blockNote;

    public BlockUserRequestDTO() {
    }

    public BlockUserRequestDTO(Long userId, Boolean isBlocked, String blockNote) {
        this.userId = userId;
        this.isBlocked = isBlocked;
        this.blockNote = blockNote;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Boolean getIsBlocked() {
        return isBlocked;
    }

    public void setIsBlocked(Boolean blocked) {
        isBlocked = blocked;
    }

    public String getBlockNote() {
        return blockNote;
    }

    public void setBlockNote(String blockNote) {
        this.blockNote = blockNote;
    }

    @Override
    public String toString() {
        return "BlockUserRequestDTO{" +
                "userId=" + userId +
                ", isBlocked=" + isBlocked +
                ", blockNote='" + blockNote + '\'' +
                '}';
    }
}