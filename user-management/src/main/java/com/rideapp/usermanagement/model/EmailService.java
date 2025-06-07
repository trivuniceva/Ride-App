package com.rideapp.usermanagement.model;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("imenkoprezimic123@gmail.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public void sendActivationEmail(String email, String token) {
        String text = "To activate your account, click the link below:\n\n" +
                "http://localhost:4200/activate-account?token=" + token;
        sendEmail(email, "Account Activation", text);
    }

    public void sendPasswordResetEmail(String email, String token) {
        String text = "To reset your password, click the link below:\n\n" +
                "http://localhost:4200/reset-password?token=" + token;
        sendEmail(email, "Password Reset Request", text);
    }

    public void sendPaymentConfirmation(String email, String token, BigDecimal price){
        System.out.println(email + " " + price + " " + token );

        String text = "Dear user,\n\n" +
                "The shared cost of your ride is: " + price + " RSD.\n\n" +
                "To confirm your payment, please click the following link:\n\n" +
                "http://localhost:4200/confirm-payment?token=" + token + "\n\n" +
                "Thank you for using our service!\n\n" +
                "The RideApp Team";


        sendEmail(email, "Confirmation of payment for the ride", text);

    }
}

