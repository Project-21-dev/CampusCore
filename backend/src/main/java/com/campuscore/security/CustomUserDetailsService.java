package com.campuscore.security;

import com.campuscore.entity.User;
import com.campuscore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Loads users for Spring Security via the existing UserRepository, keyed by
 * username. Used by DaoAuthenticationProvider during login (AuthService
 * resolves the login email to a username first) and by
 * JwtAuthenticationFilter to reconstruct the principal on every
 * authenticated request from the JWT's subject claim.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new CustomUserDetails(user);
    }
}
