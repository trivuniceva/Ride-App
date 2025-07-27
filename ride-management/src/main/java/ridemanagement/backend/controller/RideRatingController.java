package ridemanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ridemanagement.backend.dto.RideRatingDTO;
import ridemanagement.backend.model.RideRating;
import ridemanagement.backend.service.RideRatingService;

@RestController
@RequestMapping("/api/ratings")
public class RideRatingController {

    @Autowired
    private RideRatingService rideRatingService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitRideRating(@RequestBody RideRatingDTO ratingDTO) {
        try {
            RideRating savedOrUpdatedRating = rideRatingService.saveOrUpdateRideRating(ratingDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrUpdatedRating);
        } catch (IllegalStateException e) {
            System.err.println("Rating update failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN) // 403 forbidden ili 409 conflict
                    .body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error submitting ride rating: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to submit ride rating: " + e.getMessage());
        }
    }
}