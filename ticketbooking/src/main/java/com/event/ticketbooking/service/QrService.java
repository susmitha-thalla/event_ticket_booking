package com.event.ticketbooking.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class QrService {

    // =========================
    // MAIN METHOD (USED EVERYWHERE)
    // =========================

    public String generateQrImage(String qrText) {
        return generateQrImage(qrText, 250, 250);
    }

    // =========================
    // CUSTOM SIZE QR
    // =========================

    public String generateQrImage(String qrText, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            BitMatrix bitMatrix = qrCodeWriter.encode(
                    new String(qrText.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8),
                    BarcodeFormat.QR_CODE,
                    width,
                    height
            );

            BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "PNG", outputStream);

            String base64Image = Base64.getEncoder().encodeToString(outputStream.toByteArray());

            return "data:image/png;base64," + base64Image;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR image", e);
        }
    }

    // =========================
    // NEW METHOD (FIXES YOUR ERROR)
    // =========================

    public String generateBookingQrText(String bookingCode, String eventTitle, String userEmail) {
        return "BOOKING_CODE:" + bookingCode +
                "|EVENT:" + eventTitle +
                "|USER:" + userEmail;
    }

    // =========================
    // OPTIONAL: RAW BYTES (FUTURE USE)
    // =========================

    public byte[] generateQrBytes(String qrText) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            BitMatrix bitMatrix = qrCodeWriter.encode(
                    qrText,
                    BarcodeFormat.QR_CODE,
                    250,
                    250
            );

            BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "PNG", outputStream);

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR bytes", e);
        }
    }
}