package com.event.ticketbooking.dto;

public class SeatViewResponse {
    private String seatCode;
    private String rowLabel;
    private Integer seatNumber;
    private String seatStatus;
    private String sectionName;
    private String seatType;
    private Double priceOverride;

    public SeatViewResponse() {
    }

    public SeatViewResponse(String seatCode, String rowLabel, Integer seatNumber, String seatStatus,
                            String sectionName, String seatType, Double priceOverride) {
        this.seatCode = seatCode;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.seatStatus = seatStatus;
        this.sectionName = sectionName;
        this.seatType = seatType;
        this.priceOverride = priceOverride;
    }

    public String getSeatCode() {
        return seatCode;
    }

    public void setSeatCode(String seatCode) {
        this.seatCode = seatCode;
    }

    public String getRowLabel() {
        return rowLabel;
    }

    public void setRowLabel(String rowLabel) {
        this.rowLabel = rowLabel;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(Integer seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getSeatStatus() {
        return seatStatus;
    }

    public void setSeatStatus(String seatStatus) {
        this.seatStatus = seatStatus;
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
