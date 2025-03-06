package backend.rideapp.service;

import backend.rideapp.dto.DriverRegistrationDTO;
import backend.rideapp.dto.VehicleDTO;
import ridemanagement.backend.model.Vehicle;
import ridemanagement.backend.model.VehicleType;
import backend.rideapp.repository.VehicleRepository;
import com.rideapp.usermanagement.dto.RegisterRequestDTO;
import com.rideapp.usermanagement.model.ErrorResponse;
import com.rideapp.usermanagement.model.SuccessResponse;
import com.rideapp.usermanagement.model.User;
import com.rideapp.usermanagement.model.UserRole;
import com.rideapp.usermanagement.service.AuthService;
import com.rideapp.usermanagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class VehicleService {

    @Autowired
    VehicleRepository vehicleRepository;

    @Autowired
    AuthService authService;

    @Autowired
    UserService userService;


    public ResponseEntity<?> signupDriver(DriverRegistrationDTO driverRegistrationDTO) {

        VehicleDTO vehicleDTO = driverRegistrationDTO.getVehicle();
        System.out.println("vehicleDTO + " + vehicleDTO);

        RegisterRequestDTO registerRequestDTO = getRegisterDto(driverRegistrationDTO);
        authService.signup(registerRequestDTO, UserRole.DRIVER);

        if(userService.userExist(registerRequestDTO.getEmail())){
            User driver = userService.getUserByEmail(registerRequestDTO.getEmail());
            Vehicle vehicle = new Vehicle();

            System.out.println(vehicleDTO.getVehicleName());

            vehicle.setDriver(driver);
            vehicle.setRegistrationNumber(vehicleDTO.getRegistrationNumber());
            vehicle.setName(vehicleDTO.getVehicleName());
            String type = String.valueOf(vehicleDTO.getVehicleType());
            vehicle.setVehicleType(getVehicleType(type.toUpperCase()));
            try {
                vehicleRepository.save(vehicle);
                System.out.println("snimio vozilo");
                return ResponseEntity.ok(new SuccessResponse("Registration successful!"));

            } catch (Exception e) {
                System.err.println("Error saving vehicle: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to save vehicle."));
            }
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to save driver."));

    }

    private VehicleType getVehicleType(String vehicleType) {
        if(vehicleType.equals("VAN")){
            return VehicleType.VAN;
        } else if (vehicleType.equals("LUXURY")){
            return VehicleType.LUXURY;
        } else if (vehicleType.equals("STANDARD")){
            return VehicleType.STANDARD;
        }

        return null;
    }

    private RegisterRequestDTO getRegisterDto(DriverRegistrationDTO driverRegistrationDTO) {
        RegisterRequestDTO registerRequestDTO = new RegisterRequestDTO();

        registerRequestDTO.setEmail(driverRegistrationDTO.getEmail());
        registerRequestDTO.setPassword(driverRegistrationDTO.getPassword());
        registerRequestDTO.setAddress(driverRegistrationDTO.getAddress());
        registerRequestDTO.setPhone(driverRegistrationDTO.getPhone());
        registerRequestDTO.setFirstname(driverRegistrationDTO.getFirstname());
        registerRequestDTO.setLastname(driverRegistrationDTO.getLastname());

        return registerRequestDTO;

    }
}
