package ridemanagement.backend.controller;

import com.rideapp.usermanagement.dto.BlockUserRequestDTO;
import org.springframework.http.HttpStatus;
import ridemanagement.backend.dto.DriverDTO;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.dto.RideRequestDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.service.DriverService;
import ridemanagement.backend.service.PointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/driver")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @Autowired
    private PointService pointService;

    @GetMapping("/all")
    public ResponseEntity<List<DriverDTO>> getAllDrivers() {
        List<DriverDTO> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @PostMapping("/block")
    public ResponseEntity<DriverDTO> blockDriver(@RequestBody BlockUserRequestDTO request) {
        DriverDTO updatedDriver = driverService.blockDriver(request);
        return ResponseEntity.ok(updatedDriver);
    }

    @PostMapping("/logged/{driverId}")
    public ResponseEntity<?> loggedDriver(@PathVariable Long driverId) {
        try {
            driverService.recordDriverLoginTime(driverId);
            return ResponseEntity.ok("Vreme logovanja vozača uspešno zabeleženo.");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Greška pri beleženju vremena logovanja vozača: " + e.getMessage());
        }
    }

    @PostMapping("/logged-out/{driverId}")
    public ResponseEntity<?> loggedOutDriver(@PathVariable Long driverId) {
        try {
            driverService.recordDriverLogoutTime(driverId);
            return ResponseEntity.ok("Vreme odjave vozača uspešno zabeleženo.");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Greška pri beleženju vremena odjave vozača: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverDTO> getDriverById(@PathVariable Long id) {
        try {
            DriverDTO driverDTO = driverService.getDriverDTOById(id);
            return ResponseEntity.ok(driverDTO);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            System.err.println("Error fetching driver by ID: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/drivers/set-unavailable/{driverId}")
    public ResponseEntity<String> setDriverUnavailable(@PathVariable Long driverId) {
        driverService.setDriverBusyForNewRide(driverId);
        return ResponseEntity.ok("Vozač " + driverId + " je postavljen kao nedostupan.");
    }
}