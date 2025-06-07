package ridemanagement.backend.service;

import com.rideapp.usermanagement.model.EmailService;
import com.rideapp.usermanagement.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ridemanagement.backend.dto.RideRequestDTO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class SplitFareService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private TokenService tokenService;

    public void makePayment(RideRequestDTO rideRequestDTO) {

        if(isDriverAvailable()){
            confirmPayment(rideRequestDTO.getFullPrice(), rideRequestDTO.getPassengers());

        } else {

        }

    }

    private void confirmPayment(double fullPrice, List<String> passengers) {

        System.out.println("fullPrice " + fullPrice);
        System.out.println(passengers.size() + 1);

        int totalPeople = passengers.size() + 1;
        BigDecimal fullPriceDecimal = new BigDecimal(fullPrice);
        BigDecimal totalPeopleDecimal = new BigDecimal(totalPeople);

        BigDecimal pricePerPerson = fullPriceDecimal.divide(totalPeopleDecimal, 2, RoundingMode.HALF_UP);

        System.out.println("Cena po osobi: " + pricePerPerson);

        String token = tokenService.generateToken();

        for(String email: passengers) {
            emailService.sendPaymentConfirmation(email, token , pricePerPerson);
        }

    }

    private boolean isDriverAvailable() {
        return true;
    }
}
