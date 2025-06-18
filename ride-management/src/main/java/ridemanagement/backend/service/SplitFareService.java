package ridemanagement.backend.service;

import com.rideapp.usermanagement.model.EmailService;
import com.rideapp.usermanagement.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.PointDTO;
import ridemanagement.backend.dto.RideRequestDTO;
import ridemanagement.backend.model.Driver;
import ridemanagement.backend.model.Point;
import ridemanagement.backend.model.Ride;
import ridemanagement.backend.repository.RideRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SplitFareService {

    @Autowired
    private EmailService emailService;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private DriverService driverService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private RideRepository rideRepository;
    @Autowired
    private PointService pointService;

    public Ride initiateRideRequest(RideRequestDTO rideRequestDTO) {
        Ride ride = new Ride(rideRequestDTO);

        if (rideRequestDTO.getStartLocation() != null) {
            Point startPoint;
            if (rideRequestDTO.getStartLocation().getId() != null) {
                startPoint = pointService.findById(rideRequestDTO.getStartLocation().getId())
                        .orElseGet(() -> pointService.save(
                                new Point(rideRequestDTO.getStartLocation().getLatitude(),
                                        rideRequestDTO.getStartLocation().getLongitude())
                        ));
            } else {
                startPoint = pointService.save(
                        new Point(rideRequestDTO.getStartLocation().getLatitude(),
                                rideRequestDTO.getStartLocation().getLongitude())
                );
            }
            ride.setStartLocation(startPoint);
        }

        if (rideRequestDTO.getDestinationLocation() != null) {
            Point destinationPoint;
            if (rideRequestDTO.getDestinationLocation().getId() != null) {
                destinationPoint = pointService.findById(rideRequestDTO.getDestinationLocation().getId())
                        .orElseGet(() -> pointService.save(
                                new Point(rideRequestDTO.getDestinationLocation().getLatitude(),
                                        rideRequestDTO.getDestinationLocation().getLongitude())
                        ));
            } else {
                destinationPoint = pointService.save(
                        new Point(rideRequestDTO.getDestinationLocation().getLatitude(),
                                rideRequestDTO.getDestinationLocation().getLongitude())
                );
            }
            ride.setDestinationLocation(destinationPoint);
        }

        ride.setRideStatus("PENDING_DRIVER_RESPONSE");
        ride.setPaymentStatus("PENDING_DRIVER_CONFIRMATION");
        ride = rideRepository.save(ride);

        tryAssignNextDriver(ride, rideRequestDTO);

        return ride;
    }

    public void acceptRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Vožnja sa ID " + rideId + " nije pronađena."));

        if (!"PENDING_DRIVER_RESPONSE".equals(ride.getRideStatus())) {
            throw new IllegalStateException("Vožnju " + rideId + " nije moguće prihvatiti u trenutnom statusu: " + ride.getRideStatus());
        }

        confirmAndProcessPayment(ride.getFullPrice(), ride.getPassengers());

        ride.setRideStatus("ACCEPTED");
        ride.setPaymentStatus("PAID");
        rideRepository.save(ride);
    }

    public void rejectRide(Long rideId, Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new NoSuchElementException("Vožnja sa ID " + rideId + " nije pronađena."));

        if (ride.getDriverId() != null && !driverId.equals(ride.getDriverId())) {
            return;
        }

        ride.addRefusedDriver(driverId);
        ride.setDriverId(null);
        ride.setRideStatus("DRIVER_REFUSED");
        rideRepository.save(ride);

        PointDTO startLocationDTO = new PointDTO(ride.getStartLocation().getId(), ride.getStartLocation().getLatitude(), ride.getStartLocation().getLongitude());
        PointDTO destinationLocationDTO = new PointDTO(ride.getDestinationLocation().getId(), ride.getDestinationLocation().getLatitude(), ride.getDestinationLocation().getLongitude());

        RideRequestDTO reconstructedRideRequestDTO = new RideRequestDTO(
                ride.getStartAddress(),
                ride.getStops(),
                ride.getDestinationAddress(),
                startLocationDTO,
                null,
                destinationLocationDTO,
                ride.getVehicleType(),
                ride.isCarriesBabies(),
                ride.isCarriesPets(),
                ride.getPassengers(),
                ride.getPaymentStatus(),
                ride.getFullPrice(),
                ride.getRequestorEmail()
        );

        tryAssignNextDriver(ride, reconstructedRideRequestDTO);
    }

    private void tryAssignNextDriver(Ride ride, RideRequestDTO dto) {
        try {
            Driver nextDriver = driverService.findNextEligibleDriver(dto, ride.getRefusedDriverIds());

            System.out.println(nextDriver);
            System.out.println("nextDriver -------------------------");
            ride.setDriverId(nextDriver.getId());
            ride.setRideStatus("PENDING_DRIVER_RESPONSE");
            rideRepository.save(ride);

            String msg = "Imate novu vožnju od korisnika " + ride.getRequestorEmail() +
                    ". Detalji: od " + ride.getStartAddress() +
                    " do " + ride.getDestinationAddress();

            notificationService.notifyDriver(nextDriver.getId(), msg, dto, ride.getId());

        } catch (NoSuchElementException e) {
            ride.setRideStatus("ALL_DRIVERS_REFUSED");
            ride.setDriverId(null);
            rideRepository.save(ride);
        }
    }

    private void confirmAndProcessPayment(double fullPrice, List<String> passengers) {
        int totalPeople = passengers.size() + 1;
        BigDecimal fullPriceDecimal = new BigDecimal(fullPrice);
        BigDecimal totalPeopleDecimal = new BigDecimal(totalPeople);

        BigDecimal pricePerPerson = fullPriceDecimal.divide(totalPeopleDecimal, 2, RoundingMode.HALF_UP);

        String token = tokenService.generateToken();

        for(String email: passengers) {
            // emailService.sendPaymentConfirmation(email, token , pricePerPerson);
        }
    }
}
