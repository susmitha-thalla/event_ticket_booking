package com.event.ticketbooking.security;

import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new UsernameNotFoundException("User account is deleted");
        }

        if (user.getAccountStatus() != null &&
                !"ACTIVE".equalsIgnoreCase(user.getAccountStatus())) {
            throw new UsernameNotFoundException("User account is not active");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                getAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        String role = normalizeRole(user.getRole());
        return List.of(new SimpleGrantedAuthority(role));
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "ROLE_USER";
        }

        String upperRole = role.toUpperCase();

        if (upperRole.startsWith("ROLE_")) {
            return upperRole;
        }

        return "ROLE_" + upperRole;
    }
}