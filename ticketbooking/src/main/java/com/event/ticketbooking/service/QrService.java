package com.event.ticketbooking.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.FileSystems;
import java.nio.file.Path;

@Service
public class QrService {

    public String generateQrImage(String qrText) {
        try {
            String folderName = "generated_qr";
            File folder = new File(folderName);

            if (!folder.exists()) {
                folder.mkdirs();
            }

            String fileName = "qr_" + qrText + ".png";
            String filePath = folderName + "/" + fileName;

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrText, BarcodeFormat.QR_CODE, 250, 250);

            Path path = FileSystems.getDefault().getPath(filePath);
            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);

            return filePath;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR image: " + e.getMessage());
        }
    }
}