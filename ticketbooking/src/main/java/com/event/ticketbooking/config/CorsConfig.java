package com.event.ticketbooking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.*;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // =========================
        // ALLOWED ORIGINS
        // =========================
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:*",
                "https://*.vercel.app",
                "https://event-ticket-booking-eight.vercel.app"
        ));

        // =========================
        // METHODS
        // =========================
        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        // =========================
        // HEADERS
        // =========================
        configuration.setAllowedHeaders(List.of("*"));

        // =========================
        // EXPOSE HEADERS (IMPORTANT FOR JWT)
        // =========================
        configuration.setExposedHeaders(List.of(
                "Authorization",
                "Content-Type"
        ));

        // =========================
        // CREDENTIALS
        // =========================
        configuration.setAllowCredentials(true);

        // =========================
        // CACHE PREFLIGHT RESPONSE
        // =========================
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}