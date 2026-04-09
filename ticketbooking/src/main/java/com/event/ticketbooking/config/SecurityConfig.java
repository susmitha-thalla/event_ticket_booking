package com.event.ticketbooking.config;

import com.event.ticketbooking.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // =========================
                        // PUBLIC AUTH
                        // =========================
                        .requestMatchers("/api/users/register", "/api/users/login").permitAll()
                        .requestMatchers("/generated_qr/**").permitAll()

                        // =========================
                        // PUBLIC EVENT APIs
                        // =========================
                        .requestMatchers(HttpMethod.GET,
                                "/api/events/all",
                                "/api/events/live",
                                "/api/events/upcoming",
                                "/api/events/completed",
                                "/api/events/starting-soon",
                                "/api/events/seat-based",
                                "/api/events/non-seat-based",
                                "/api/events/date",
                                "/api/events/filter",
                                "/api/events/category/**",
                                "/api/events/location/**",
                                "/api/events/*"
                        ).permitAll()

                        // =========================
                        // ORGANIZER / ADMIN EVENT WRITE APIs
                        // service layer will still verify ownership/admin
                        // =========================
                        .requestMatchers(HttpMethod.POST,
                                "/api/events/create"
                        ).authenticated()

                        .requestMatchers(HttpMethod.POST,
                                "/api/events/approve/**",
                                "/api/events/reject/**"
                        ).authenticated()

                        .requestMatchers(HttpMethod.PUT,
                                "/api/events/*"
                        ).authenticated()

                        .requestMatchers(HttpMethod.DELETE,
                                "/api/events/*"
                        ).authenticated()

                        .requestMatchers(HttpMethod.GET,
                                "/api/events/my-events",
                                "/api/events/my-events/**",
                                "/api/events/admin/all",
                                "/api/events/admin/pending"
                        ).authenticated()

                        .requestMatchers(HttpMethod.POST,
                                "/api/seats/layout/**"
                        ).authenticated()

                        .requestMatchers(HttpMethod.GET,
                                "/api/seats/event/**"
                        ).permitAll()

                        // =========================
                        // BOOKING APIs
                        // =========================
                        .requestMatchers(HttpMethod.POST,
                                "/api/bookings/book"
                        ).authenticated()

                        .requestMatchers(HttpMethod.GET,
                                "/api/bookings/my-bookings",
                                "/api/bookings/organizer-bookings",
                                "/api/bookings/organizer-bookings/**",
                                "/api/bookings/all",
                                "/api/bookings/event/**",
                                "/api/bookings/user/**",
                                "/api/bookings/*"
                        ).authenticated()

                        .requestMatchers(HttpMethod.PUT,
                                "/api/bookings/cancel/**",
                                "/api/bookings/admin/cancel/**"
                        ).authenticated()

                        // =========================
                        // USER MANAGEMENT
                        // =========================
                        .requestMatchers("/api/users/all").authenticated()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
