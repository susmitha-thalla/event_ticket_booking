package com.event.ticketbooking.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final String WALLPAPER_DIR = "generated_wallpapers";

    public String storeWallpaper(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Wallpaper file is required");
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "wallpaper";
        String extension = extractExtension(originalName);
        String safeExtension = extension.isBlank() ? "jpg" : extension.toLowerCase(Locale.ROOT);

        if (!isAllowedExtension(safeExtension)) {
            throw new RuntimeException("Only JPG, JPEG, PNG, WEBP images are allowed");
        }

        Path uploadDir = Paths.get(new File(WALLPAPER_DIR).getAbsolutePath());
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to create wallpaper directory", ex);
        }

        String fileName = "wallpaper-" + UUID.randomUUID() + "." + safeExtension;
        Path target = uploadDir.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store wallpaper file", ex);
        }

        return fileName;
    }

    private String extractExtension(String fileName) {
        int idx = fileName.lastIndexOf('.');
        if (idx < 0 || idx == fileName.length() - 1) return "";
        return fileName.substring(idx + 1);
    }

    private boolean isAllowedExtension(String ext) {
        return ext.equals("jpg") || ext.equals("jpeg") || ext.equals("png") || ext.equals("webp");
    }
}
