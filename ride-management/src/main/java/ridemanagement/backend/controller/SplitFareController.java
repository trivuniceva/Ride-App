package ridemanagement.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ridemanagement.backend.dto.SplitFareRequestDTO;
import ridemanagement.backend.service.SplitFareService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/split-fare")
public class SplitFareController {

    @Autowired
    private SplitFareService splitFareService;

    @PostMapping
    public ResponseEntity<Map<String, String>> receiveEmails(@RequestBody SplitFareRequestDTO request) {
        List<String> emails = request.getEmails();
        double fullPrice = request.getFullPrice();

        System.out.println("Primljeni mejlovi: " + emails);
        System.out.println("Cena: " + fullPrice);

//        splitFareService.makePayment(emails);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("message", "Emails received"));

    }
}
