package com.rideapp.usermanagement.service;

import org.springframework.stereotype.Service;
import com.rideapp.usermanagement.model.User;

import java.util.UUID;

@Service
public class TokenService {

    public String generateToken() {
        return UUID.randomUUID().toString();
    }

}
