package com.rideapp.usermanagement.service;

import com.rideapp.usermanagement.DTO.ResetPasswordRequest;
import com.rideapp.usermanagement.model.EmailService;
import com.rideapp.usermanagement.model.ErrorResponse;
import com.rideapp.usermanagement.model.SuccessResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;
import com.rideapp.usermanagement.repository.UserRepository;
import com.rideapp.usermanagement.model.User;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmailService emailService;

    public User getUserByEmail(String email) {
        System.out.println("userRepository.findByEmail(email);  " + userRepository.findByEmail(email));
        return userRepository.findByEmail(email);
    }

    public boolean userExist(String email) {
        return userRepository.findByEmail(email) != null;
    }

    public boolean validPassword(User user, String password) {
        System.out.println("user.getPassword().equals(password); " + user.getPassword().equals(password));
        return user.getPassword().equals(password);
    }

    public ResponseEntity<String> sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            String token = tokenService.generateToken();

            user.setResetToken(token);
            userRepository.save(user);
            System.out.println("Token saved: " + token);

            emailService.sendPasswordResetEmail(email, token);

            return ResponseEntity.ok("Password reset email sent.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
    }


    public ResponseEntity<?> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken());
        if (user == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid token."));
        }

        user.setPassword(request.getNewPassword());
        user.setResetToken(null);
        userRepository.save(user);
        System.out.println("snimioooo novi sifru");

        return ResponseEntity.ok(new SuccessResponse("Password reset successfully."));
    }


    public User findByResetToken(String token) {
        return userRepository.findByResetToken(token);
    }


    public void save(User user) {
        userRepository.save(user);
        System.out.println("maaaaac mac mac");
    }
}
