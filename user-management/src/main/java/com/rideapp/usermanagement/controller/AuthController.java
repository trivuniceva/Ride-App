package com.rideapp.usermanagement.controller;


import com.rideapp.usermanagement.dto.RegisterRequestDTO;
import com.rideapp.usermanagement.model.SuccessResponse;
import com.rideapp.usermanagement.model.User;
import com.rideapp.usermanagement.model.UserRole;
import com.rideapp.usermanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        User user = authService.login(loginUser.getEmail(), loginUser.getPassword());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect email or password.");
        }

        System.out.println("user::: " + user.toString());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDTO registerRequest) {

        System.out.println("Registration request received: " + registerRequest.getEmail());

        System.out.println(" - - - - - - - ");
        System.out.println(registerRequest.toString());

        authService.signup(registerRequest, UserRole.REGISTERED_USER);

        return ResponseEntity.ok(new SuccessResponse("Registration successful!"));
    }







}
