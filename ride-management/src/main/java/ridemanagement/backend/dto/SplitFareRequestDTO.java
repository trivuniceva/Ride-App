package ridemanagement.backend.dto;

import java.util.List;

public class SplitFareRequestDTO {

    private List<String> emails;
    private double fullPrice;


    public List<String> getEmails() {
        return emails;
    }

    public void setEmails(List<String> emails) {
        this.emails = emails;
    }

    public double getFullPrice() {
        return fullPrice;
    }

    public void setFullPrice(double fullPrice) {
        this.fullPrice = fullPrice;
    }
}
