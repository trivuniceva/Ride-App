package com.rideapp.usermanagement.controller;

import com.rideapp.usermanagement.DTO.ForgotPasswordRequest;
import com.rideapp.usermanagement.DTO.ResetPasswordRequest;
import com.rideapp.usermanagement.model.ErrorResponse;
import com.rideapp.usermanagement.model.SuccessResponse;
import com.rideapp.usermanagement.model.User;
import com.rideapp.usermanagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.sendPasswordResetEmail(request.getEmail());
        return ResponseEntity.ok(new SuccessResponse("Password reset email sent if email exists."));
    }


    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        System.out.println("Token received: " + request.getToken());
        System.out.println("New Password received: " + request.getNewPassword());

        return userService.resetPassword(request);
    }

//    @PostMapping("/reset-password")
//    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
//        System.out.println("Token received: " + request.getToken());
//        System.out.println("New Password received: " + request.getNewPassword());
//
//        User user = userService.findByResetToken(request.getToken());
//        if (user == null) {
//            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid token."));
//        }
//
//        user.setPassword(request.getNewPassword());
//        user.setResetToken(null);
//        userService.save(user);
//
//        return ResponseEntity.ok(new SuccessResponse("Password reset successfully."));
//    }


}
