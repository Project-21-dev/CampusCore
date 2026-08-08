package com.campuscore.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final long expirationTime;

    public JwtUtil(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationTime) {
        String effectiveSecret = secret;
        if (effectiveSecret == null || effectiveSecret.isBlank()) {
            byte[] randomSecret = new byte[48];
            new SecureRandom().nextBytes(randomSecret);
            effectiveSecret = Base64.getEncoder().encodeToString(randomSecret);
            System.err.println("WARNING: APP_JWT_SECRET is not set. Using an ephemeral JWT key for this run; all sessions will be invalid after restart.");
        }
        if (effectiveSecret.length() < 32) {
            throw new IllegalStateException("APP_JWT_SECRET/app.jwt.secret must be at least 32 characters");
        }
        this.signingKey = Keys.hmacShaKeyFor(effectiveSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationTime = expirationTime;
    }

    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, String username) {
        try {
            Claims claims = extractClaims(token);
            return username != null
                    && username.equals(claims.getSubject())
                    && claims.getExpiration() != null
                    && claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }
}
