package ridemanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.dto.RideRequestDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.service.RideService;
import ridemanagement.backend.service.SplitFareService;

import java.util.List;
import java.util.Map;
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
        System.out.println("Primljen zahtev za vožnju: " + rideRequestDTO.toString());

        splitFareService.makePayment(rideRequestDTO);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Ride created successfully"));
    }

    @PostMapping("/accept")
    public ResponseEntity<Map<String, String>> acceptRide(@RequestBody RideRequestDTO rideRequestDTO) {
        System.out.println("Vozač je prihvatio vožnju, izvršavam payment.");

        try {
            splitFareService.makePayment(rideRequestDTO);
            // Vraća JSON objekat sa porukom
            return ResponseEntity.ok(Map.of("message", "Payment executed after driver accepted the ride."));
        } catch (Exception e) {
            // U slučaju greške tokom makePayment, vratite odgovarajući HTTP status kod i JSON grešku
            System.err.println("Greška prilikom prihvatanja vožnje: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Došlo je do greške prilikom obrade plaćanja: " + e.getMessage()));
        }
    }




}
