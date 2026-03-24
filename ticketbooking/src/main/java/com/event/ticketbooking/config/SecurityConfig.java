package com.event.ticketbooking.config;

import com.event.ticketbooking.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                        .requestMatchers("/api/users/register", "/api/users/login").permitAll()
                        .requestMatchers("/api/events/all", "/api/events/category/**", "/api/events/location/**", "/api/events/filter", "/api/events/date").permitAll()

                        // authenticated endpoints
                        .requestMatchers("/api/events/create").authenticated()
                        .requestMatchers("/api/events/my-events").authenticated()
                        .requestMatchers("/api/events/admin/all").authenticated()
                        .requestMatchers("/api/events/approve/**").authenticated()

                        .requestMatchers("/api/bookings/book").authenticated()
                        .requestMatchers("/api/bookings/my-bookings").authenticated()
                        .requestMatchers("/api/bookings/organizer-bookings").authenticated()
                        .requestMatchers("/api/bookings/all").authenticated()

                        .requestMatchers("/api/users/all").authenticated()
                        .requestMatchers("/generated_qr/**").permitAll()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}