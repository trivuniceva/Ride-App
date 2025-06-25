package com.rideapp.usermanagement.service;

import com.rideapp.usermanagement.dto.*;
import com.rideapp.usermanagement.model.*;
import com.rideapp.usermanagement.repository.DriverProfileUpdateRequestRepository;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverProfileUpdateRequestRepository driverProfileUpdateRequestRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmailService emailService;

    private final String UPLOAD_DIR = "/Users/nikolina/Desktop/Projekti/bs/";

    public User getUserByEmail(String email) {
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

    @Transactional
    public ResponseEntity<?> updateProfile(Long userId, UserUpdateRequestDTO updateRequest) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found with ID: " + userId));
        }
        User user = userOptional.get();

        if (user.getUserRole() == UserRole.DRIVER) {
            DriverProfileUpdateRequest updateRequestEntity = new DriverProfileUpdateRequest();
            updateRequestEntity.setDriver(user);
            updateRequestEntity.setOldFirstname(user.getFirstname());
            updateRequestEntity.setNewFirstname(updateRequest.getFirstname());
            updateRequestEntity.setOldLastname(user.getLastname());
            updateRequestEntity.setNewLastname(updateRequest.getLastname());
            updateRequestEntity.setOldAddress(user.getAddress());
            updateRequestEntity.setNewAddress(updateRequest.getAddress());
            updateRequestEntity.setOldPhone(user.getPhone());
            updateRequestEntity.setNewPhone(updateRequest.getPhone());
            updateRequestEntity.setStatus(DriverProfileUpdateRequest.UpdateRequestStatus.PENDING);
            updateRequestEntity.setRequestDate(LocalDateTime.now());

            driverProfileUpdateRequestRepository.save(updateRequestEntity);

            return ResponseEntity.ok(new SuccessResponse("Zahtev za ažuriranje profila vozača poslat na odobrenje administratoru."));

        } else {
            user.setFirstname(updateRequest.getFirstname());
            user.setLastname(updateRequest.getLastname());
            user.setAddress(updateRequest.getAddress());
            user.setPhone(updateRequest.getPhone());
            userRepository.save(user);
            return ResponseEntity.ok(convertToUserDTO(user));
        }
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

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid file name."));
        }

        String sanitizedFileName = originalFileName.replaceAll("[/\\\\?%*:|\"<>]", "");
        sanitizedFileName = sanitizedFileName.replaceAll("\\.{2,}", ""); // Remove multiple dots like ".."

        if (sanitizedFileName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid file name after sanitization."));
        }

        try {
            String finalFileName = UUID.randomUUID().toString() + "_" + sanitizedFileName;
            Path uploadPath = Paths.get(UPLOAD_DIR);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(finalFileName).normalize();

            if (!filePath.startsWith(uploadPath)) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Attempted path traversal detected."));
            }

            Files.copy(file.getInputStream(), filePath);

            String relativePath = "/profile_pictures/" + finalFileName;
            user.setProfilePic(relativePath);
            userRepository.save(user);

            return ResponseEntity.ok(new SuccessResponse("Profile picture uploaded successfully!", relativePath));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to upload profile picture: " + e.getMessage()));
        }
    }

    public List<DriverUpdateRequestDTO> getPendingDriverUpdateRequests() {
        return driverProfileUpdateRequestRepository.findByStatus(DriverProfileUpdateRequest.UpdateRequestStatus.PENDING).stream()
                .map(request -> new DriverUpdateRequestDTO(
                        request.getId(),
                        request.getDriver().getId(),
                        request.getDriver().getEmail(),
                        request.getOldFirstname(),
                        request.getNewFirstname(),
                        request.getOldLastname(),
                        request.getNewLastname(),
                        request.getOldAddress(),
                        request.getNewAddress(),
                        request.getOldPhone(),
                        request.getNewPhone(),
                        request.getRequestDate()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public ResponseEntity<?> approveDriverProfileUpdate(Long requestId) {
        Optional<DriverProfileUpdateRequest> requestOptional = driverProfileUpdateRequestRepository.findById(requestId);
        if (requestOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Zahtev za ažuriranje nije pronađen."));
        }
        DriverProfileUpdateRequest request = requestOptional.get();

        if (request.getStatus() != DriverProfileUpdateRequest.UpdateRequestStatus.PENDING) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Zahtev je već obrađen."));
        }

        User driver = request.getDriver();
        driver.setFirstname(request.getNewFirstname());
        driver.setLastname(request.getNewLastname());
        driver.setAddress(request.getNewAddress());
        driver.setPhone(request.getNewPhone());
        userRepository.save(driver);

        request.setStatus(DriverProfileUpdateRequest.UpdateRequestStatus.APPROVED);
        request.setProcessedDate(LocalDateTime.now());
        driverProfileUpdateRequestRepository.save(request);

        return ResponseEntity.ok(new SuccessResponse("Profil vozača uspešno ažuriran i zahtev odobren."));
    }

    @Transactional
    public ResponseEntity<?> rejectDriverProfileUpdate(Long requestId) {
        Optional<DriverProfileUpdateRequest> requestOptional = driverProfileUpdateRequestRepository.findById(requestId);
        if (requestOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Zahtev za ažuriranje nije pronađen."));
        }
        DriverProfileUpdateRequest request = requestOptional.get();

        if (request.getStatus() != DriverProfileUpdateRequest.UpdateRequestStatus.PENDING) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Zahtev je već obrađen."));
        }

        request.setStatus(DriverProfileUpdateRequest.UpdateRequestStatus.REJECTED);
        request.setProcessedDate(LocalDateTime.now());
        driverProfileUpdateRequestRepository.save(request);

        return ResponseEntity.ok(new SuccessResponse("Zahtev za ažuriranje profila vozača je odbijen."));
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