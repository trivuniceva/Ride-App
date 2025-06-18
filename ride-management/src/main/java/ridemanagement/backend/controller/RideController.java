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
        System.out.println("Primljen zahtev za vožnju: " + rideRequestDTO.toString());

        try {
            splitFareService.processRideRequest(rideRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Zahtev za vožnju uspešno poslat vozaču."));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Došlo je do greške prilikom obrade zahteva za vožnju: " + e.getMessage()));
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<Map<String, String>> acceptRide(@RequestBody RideRequestDTO rideRequestDTO) {
        System.out.println("Vozač je prihvatio vožnju, izvršavam payment.");

        try {
            splitFareService.confirmAndProcessPayment(rideRequestDTO);
            return ResponseEntity.ok(Map.of("message", "Vožnja uspešno prihvaćena. Plaćanje izvršeno."));
        } catch (Exception e) {
            System.err.println("Greška prilikom prihvatanja vožnje: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Došlo je do greške prilikom potvrđivanja vožnje i obrade plaćanja: " + e.getMessage()));
        }
    }
}