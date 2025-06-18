package ridemanagement.backend.service;

import com.rideapp.usermanagement.model.EmailService;
import com.rideapp.usermanagement.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.RideRequestDTO;
import ridemanagement.backend.model.Driver;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.NoSuchElementException; // Dodajte import

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

    public void processRideRequest(RideRequestDTO rideRequestDTO) {
        System.out.println("Processing ride request: " + rideRequestDTO.toString());

        Driver driver = driverService.findEligibleDriver(rideRequestDTO);

        if (driver != null) {
            System.out.println("Sistem: Pronadjen vozač: " + driver.getEmail());
            String msg = "Imate novu vožnju od korisnika " + rideRequestDTO.getRequestorEmail() + ". Detalji: od " +
                    rideRequestDTO.getStartAddress() + " do " + rideRequestDTO.getDestinationAddress();
            notificationService.notifyDriver(driver.getId(), msg, rideRequestDTO);
        } else {
            System.out.println("Sistem: Nema dostupnih vozača, vožnja se odbija.");
            throw new NoSuchElementException("Nema dostupnih vozača za ovu vožnju. Zahtev odbijen.");
        }
    }

    public void confirmAndProcessPayment(RideRequestDTO rideRequestDTO) {
        System.out.println("Izvršavam plaćanje za vožnju: " + rideRequestDTO.toString());

        double fullPrice = rideRequestDTO.getFullPrice();
        List<String> passengers = rideRequestDTO.getPassengers();

        System.out.println("fullPrice " + fullPrice);
        System.out.println(passengers.size() + 1);

        int totalPeople = passengers.size() + 1;
        BigDecimal fullPriceDecimal = new BigDecimal(fullPrice);
        BigDecimal totalPeopleDecimal = new BigDecimal(totalPeople);

        BigDecimal pricePerPerson = fullPriceDecimal.divide(totalPeopleDecimal, 2, RoundingMode.HALF_UP);

        System.out.println("Cena po osobi: " + pricePerPerson);

        String token = tokenService.generateToken();

        for(String email: passengers) {
//            emailService.sendPaymentConfirmation(email, token , pricePerPerson);
        }
        // TODO: rideRepository.updateRideStatus(rideRequestDTO.getId(), RideStatus.ACCEPTED);
    }
}