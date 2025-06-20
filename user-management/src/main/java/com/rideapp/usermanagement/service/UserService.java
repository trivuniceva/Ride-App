package com.rideapp.usermanagement.service;

import com.rideapp.usermanagement.dto.BlockUserRequestDTO;
import com.rideapp.usermanagement.dto.ResetPasswordRequestDTO;
import com.rideapp.usermanagement.dto.UserDTO;
import com.rideapp.usermanagement.model.*;
import com.rideapp.usermanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    public ResponseEntity<?> resetPassword(ResetPasswordRequestDTO request) {
        User user = userRepository.findByResetToken(request.getToken());
        if (user == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid token."));
        }

        user.setPassword(request.getNewPassword());
        user.setResetToken(null);
        userRepository.save(user);
        return ResponseEntity.ok(new SuccessResponse("Password reset successfully."));
    }

    public List<UserDTO> getAllRegisteredUsers() {
        return userRepository.findByUserRole(UserRole.REGISTERED_USER).stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResponseEntity<?> blockUser(BlockUserRequestDTO request) {
        Optional<User> userOptional = userRepository.findById(request.getUserId());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found with ID: " + request.getUserId()));
        }

        User user = userOptional.get();

        if (user.getUserRole().equals(UserRole.ADMINISTRATOR)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Administrators cannot be blocked/deactivated."));
        }

        user.setActive(request.getIsBlocked());
        user.setBlockNote(request.getBlockNote());
        userRepository.save(user);

        return ResponseEntity.ok(convertToUserDTO(user));
    }

    public UserDTO convertToUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstname(),
                user.getLastname(),
                user.getUserRole(),
                user.getAddress(),
                user.getPhone(),
                user.isActive(),
                user.getBlockNote()
        );
    }
}