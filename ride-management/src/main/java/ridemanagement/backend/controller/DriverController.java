package ridemanagement.backend.controller;

import com.rideapp.usermanagement.dto.BlockUserRequestDTO;
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

    // Dodaj ostale metode vezane za vozače ako su potrebne, npr. findEligibleDriver, itd.
    // Primer ako želiš da izbaciš neke od metoda iz DriverService direktno u Controller:
    /*
    @PostMapping("/find-eligible")
    public ResponseEntity<DriverDTO> findEligibleDriver(@RequestBody RideRequestDTO rideRequestDTO) {
        Driver driver = driverService.findEligibleDriver(rideRequestDTO);
        return ResponseEntity.ok(driverService.convertToDTO(driver));
    }
    */
}