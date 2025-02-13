package backend.rideapp.controller;

import backend.rideapp.dto.DriverRegistrationDTO;
import backend.rideapp.service.VehicleService;
import com.rideapp.usermanagement.model.SuccessResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/vehicle")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @PostMapping("/signup-driver")
    public ResponseEntity<?> registerDriver(@RequestBody DriverRegistrationDTO driverRegistrationDTO) {

        System.out.println(driverRegistrationDTO);

        System.out.println(" - - - - - - - ");

        vehicleService.signupDriver(driverRegistrationDTO);


        return ResponseEntity.ok(new SuccessResponse("Registration successful!"));
    }
}
