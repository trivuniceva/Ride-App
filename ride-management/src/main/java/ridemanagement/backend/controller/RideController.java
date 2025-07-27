package ridemanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.dto.RideRequestDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Ride;
import ridemanagement.backend.service.RideService;
import ridemanagement.backend.service.SplitFareService;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/rides")
public class RideController {

    @Autowired
    private RideService rideService;

    @Autowired
    private SplitFareService splitFareService;


    @GetMapping("/active")
    public List<DriverDTO> getActiveDrivers() {
        List<Driver> drivers = rideService.getAllDrivers().stream()
                .filter(Driver::isAvailable)
                .collect(Collectors.toList());

        return drivers.stream()
                .map(rideService::convertToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createRide(@RequestBody RideRequestDTO rideRequestDTO) {
        try {
            Ride newRide = splitFareService.initiateRideRequest(rideRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Zahtev za vožnju uspešno poslat vozaču.",
                            "rideId", newRide.getId().toString()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Došlo je do greške prilikom obrade zahteva za vožnju: " + e.getMessage()));
        }
    }

    @PostMapping("/accept/{rideId}/{driverId}")
    public ResponseEntity<Map<String, String>> acceptRide(
            @PathVariable Long rideId,
            @PathVariable Long driverId) {
        try {
            splitFareService.acceptRide(rideId);
            return ResponseEntity.ok(Map.of("message", "Vožnja " + rideId + " uspešno prihvaćena. Plaćanje izvršeno."));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Došlo je do greške prilikom prihvatanja vožnje: " + e.getMessage()));
        }
    }

    @PostMapping("/reject/{rideId}/{driverId}")
    public ResponseEntity<Map<String, String>> rejectRide(
            @PathVariable Long rideId,
            @PathVariable Long driverId) {
        try {
            splitFareService.rejectRide(rideId, driverId);
            return ResponseEntity.ok(Map.of("message", "Vožnja " + rideId + " je odbijena. Traži se sledeći vozač."));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Došlo je do greške prilikom odbijanja vožnje: " + e.getMessage()));
        }
    }

    @GetMapping("/history/{userId}/{userRole}")
    public ResponseEntity<List<Ride>> getRideHistoryForLoggedUser(
            @PathVariable Long userId,
            @PathVariable String userRole,
            @RequestParam(required = false) String userEmail) {
        try {
            List<Ride> rides = rideService.getRideHistoryForUser(userId, userRole, userEmail);
            if (rides.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(Collections.emptyList());
            }
            return ResponseEntity.ok(rides);
        } catch (Exception e) {
            System.err.println("Error fetching ride history: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }
}