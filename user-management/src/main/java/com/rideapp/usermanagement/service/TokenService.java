package com.rideapp.usermanagement.service;

import org.springframework.stereotype.Service;
import com.rideapp.usermanagement.model.User;

import java.util.UUID;

@Service
public class TokenService {

    public String generateActivationToken() {
        return UUID.randomUUID().toString();
    }


    public String generateResetToken(User user) {
        return UUID.randomUUID().toString();
    }
}
