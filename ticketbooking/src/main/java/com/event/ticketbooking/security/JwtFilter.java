package com.event.ticketbooking.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        try {
            if (authHeader != null && !authHeader.isBlank()) {
                String trimmedHeader = authHeader.trim();

                if (trimmedHeader.startsWith("Bearer ")) {
                    token = trimmedHeader.substring(7).trim();
                } else if (trimmedHeader.startsWith("bearer ")) {
                    token = trimmedHeader.substring(7).trim();
                } else {
                    token = trimmedHeader;
                }

                if (token != null && token.startsWith("\"") && token.endsWith("\"") && token.length() > 1) {
                    token = token.substring(1, token.length() - 1).trim();
                }

                if (token != null && !token.isBlank()) {
                    email = jwtUtil.extractEmail(token);
                    System.out.println("JWT Filter - extracted email: " + email);
                }
            }

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

                boolean isValid = jwtUtil.isTokenValid(token);
                System.out.println("JWT Filter - token valid: " + isValid);
                System.out.println("JWT Filter - authorities: " + userDetails.getAuthorities());

                if (isValid) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    System.out.println("JWT Filter - authentication set for: " + email);
                } else {
                    System.out.println("JWT Filter - invalid token");
                }
            }

        } catch (Exception ex) {
            SecurityContextHolder.clearContext();
            System.out.println("JWT Filter Error: " + ex.getMessage());
            ex.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}