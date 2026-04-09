package com.event.ticketbooking.controller;

import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.UserRepository;
import com.event.ticketbooking.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
public class UploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/wallpaper")
    public Map<String, String> uploadWallpaper(@RequestParam("file") MultipartFile file,
                                               Principal principal,
                                               HttpServletRequest request) {
        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOrganizer = "ORGANIZER".equalsIgnoreCase(user.getRole()) || "ROLE_ORGANIZER".equalsIgnoreCase(user.getRole());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole()) || "ROLE_ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOrganizer && !isAdmin) {
            throw new RuntimeException("Only organizer/admin can upload wallpapers");
        }

        String fileName = fileStorageService.storeWallpaper(file);

        String baseUrl = request.getScheme() + "://" + request.getServerName()
                + ((request.getServerPort() == 80 || request.getServerPort() == 443) ? "" : ":" + request.getServerPort());

        String url = baseUrl + "/wallpapers/" + fileName;
        return Map.of("url", url, "fileName", fileName);
    }
}
