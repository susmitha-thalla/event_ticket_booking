package com.event.ticketbooking.dto;

import java.util.List;

public class SeatLayoutRequest {

    private List<String> seatCodes;
    private String sectionName;
    private String seatType;
    private Double priceOverride;

    public SeatLayoutRequest() {
    }

    public List<String> getSeatCodes() {
        return seatCodes;
    }

    public void setSeatCodes(List<String> seatCodes) {
        this.seatCodes = seatCodes;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public String getSeatType() {
        return seatType;
    }

    public void setSeatType(String seatType) {
        this.seatType = seatType;
    }

    public Double getPriceOverride() {
        return priceOverride;
    }

    public void setPriceOverride(Double priceOverride) {
        this.priceOverride = priceOverride;
    }
}
