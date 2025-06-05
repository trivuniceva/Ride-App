package ridemanagement.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/split-fare")
public class SplitFareController {

    @PostMapping
    public ResponseEntity<Map<String, String>> receiveEmails(@RequestBody Map<String, List<String>> payload) {
        List<String> emails = payload.get("emails");
        // TODO: obrada - slanje notifikacija, cuvanje u bazi itd.
        System.out.println("Primljeni mejlovi: " + emails);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("message", "Emails received"));

    }
}
