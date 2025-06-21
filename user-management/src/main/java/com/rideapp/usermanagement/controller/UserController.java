package com.rideapp.usermanagement.controller;

import com.rideapp.usermanagement.dto.*;
import com.rideapp.usermanagement.model.SuccessResponse;
import com.rideapp.usermanagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        userService.sendPasswordResetEmail(request.getEmail());
        return ResponseEntity.ok(new SuccessResponse("Password reset email sent if email exists."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        System.out.println("Token received: " + request.getToken());
        System.out.println("New Password received: " + request.getNewPassword());
        return userService.resetPassword(request);
    }

    @GetMapping("/registered")
    public ResponseEntity<List<UserDTO>> getAllRegisteredUsers() {
        List<UserDTO> users = userService.getAllRegisteredUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/block")
    public ResponseEntity<?> blockUser(@RequestBody BlockUserRequestDTO request) {
        return userService.blockUser(request);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody UserUpdateRequestDTO updateRequest) {
        return userService.updateProfile(userId, updateRequest);
    }

    @PostMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody ChangePasswordRequestDTO request) {
        return userService.changePassword(userId, request);
    }

    @PostMapping("/{userId}/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        return userService.uploadProfilePicture(userId, file);
    }


}