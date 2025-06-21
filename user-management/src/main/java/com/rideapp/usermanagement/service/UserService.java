package com.rideapp.usermanagement.service;

import com.rideapp.usermanagement.dto.*;
import com.rideapp.usermanagement.model.*;
import com.rideapp.usermanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmailService emailService;

    private final String UPLOAD_DIR = "src/main/resources/static/profile_pictures/";


    public User getUserByEmail(String email) {
        System.out.println("userRepository.findByEmail(email);  " + userRepository.findByEmail(email));
        return userRepository.findByEmail(email);
    }

    public boolean userExist(String email) {
        return userRepository.findByEmail(email) != null;
    }

    public boolean validPassword(User user, String password) {
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

    // --- NOVE METODE ---

    @Transactional
    public ResponseEntity<?> updateProfile(Long userId, UserUpdateRequestDTO updateRequest) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found with ID: " + userId));
        }

        User user = userOptional.get();

        // Ažuriraj samo polja koja su dozvoljena
        user.setFirstname(updateRequest.getFirstname());
        user.setLastname(updateRequest.getLastname());
        user.setAddress(updateRequest.getAddress());
        user.setPhone(updateRequest.getPhone());

        // Logika za odobravanje promena vozača
        if (user.getUserRole() == UserRole.DRIVER) {
            // OVDE bi trebalo da se implementira mehanizam za "pending" promene
            // Na primer, umesto direktnog snimanja, sačuvati promene u nekoj privremenoj tabeli
            // i poslati notifikaciju administratoru.
            // Za sada, radi demonstracije, direktno ćemo snimiti, ali ovo je mesto za tu logiku.
            // Za pravu implementaciju:
            // 1. Kreirati PendingDriverUpdate model/tabelu.
            // 2. Sačuvati UserUpdateRequestDTO i userId u toj tabeli.
            // 3. Status postaviti na PENDING.
            // 4. Administrator preko svog panela odobrava te promene, i tek onda se upisuju u User tabelu.
            System.out.println("Promene za vozača moraju biti odobrene od strane administratora! (Simulacija - direktno se snima)");
        }

        userRepository.save(user);
        return ResponseEntity.ok(convertToUserDTO(user));
    }

    @Transactional
    public ResponseEntity<?> changePassword(Long userId, ChangePasswordRequestDTO request) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found with ID: " + userId));
        }

        User user = userOptional.get();

        if (!validPassword(user, request.getOldPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Incorrect old password."));
        }

        user.setPassword(request.getNewPassword());
        userRepository.save(user);

        return ResponseEntity.ok(new SuccessResponse("Password changed successfully."));
    }

    public ResponseEntity<?> uploadProfilePicture(Long userId, MultipartFile file) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found with ID: " + userId));
        }

        User user = userOptional.get();

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Please select a file to upload."));
        }

        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            user.setProfilePic("/profile_pictures/" + fileName);
            userRepository.save(user);

            return ResponseEntity.ok(new SuccessResponse("Profile picture uploaded successfully!"));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to upload profile picture: " + e.getMessage()));
        }
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
                user.getBlockNote(),
                user.getProfilePic()
        );
    }
}