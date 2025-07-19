package ridemanagement.backend.controller;

import org.springframework.web.bind.annotation.*;
import ridemanagement.backend.dto.VehicleTypeDto;
import ridemanagement.backend.model.VehicleType;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vehicle-types")
public class VehicleTypeController {

    @GetMapping
    public List<VehicleTypeDto> getVehicleTypes() {
        return Arrays.stream(VehicleType.values())
                .map(type -> new VehicleTypeDto(type.name(), type.getPrice()))
                .collect(Collectors.toList());
    }
}
