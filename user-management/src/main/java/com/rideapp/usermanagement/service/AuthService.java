package com.rideapp.usermanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.rideapp.usermanagement.dto.RegisterRequestDTO;
import com.rideapp.usermanagement.model.*;
import com.rideapp.usermanagement.repository.UserRepository;


@Service
public class AuthService {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmailService emailService;

    public User login(String email, String password) {
        System.out.println("email: " + email);
        System.out.println("password: " + password);

        User user = userService.getUserByEmail(email);
        if (user != null && userService.validPassword(user, password)) {
            System.out.println("dobar korisnik: " + user.getProfilePic());
            return user;
        }
        return null;
    }

    public ResponseEntity<?> signup(RegisterRequestDTO registerRequest, UserRole userRole) {
        if(isEmailTaken(registerRequest.getEmail())){
            return ResponseEntity.status(400).body(new ErrorResponse("Email is already in use."));
        }

        User newUser = new User();
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(registerRequest.getPassword());
        newUser.setFirstname(registerRequest.getFirstname());
        newUser.setLastname(registerRequest.getLastname());
        newUser.setAddress(registerRequest.getAddress());
        newUser.setPhone(registerRequest.getPhone());
        newUser.setUserRole(userRole);
        newUser.setResetToken(tokenService.generateToken());

        try {
            userRepository.save(newUser);
            System.out.println("snimio korisnika");
            String token = tokenService.generateToken();
            newUser.setResetToken(token);
            emailService.sendActivationEmail(newUser.getEmail(), newUser.getResetToken());

            return ResponseEntity.ok(new SuccessResponse("Registration successful! Please check your email to activate your account."));

        } catch (Exception e) {
            System.err.println("Error saving user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to save user."));
        }
    }

    private boolean isEmailTaken(String email){
        return userService.getUserByEmail(email) != null;
    }

}