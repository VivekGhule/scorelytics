package com.scorelytics.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    public String generateTokenForUserId(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(signingKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String extractUserId(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    private SecretKey signingKey() {
        byte[] keyBytes = jwtSecret == null ? new byte[0] : jwtSecret.getBytes(StandardCharsets.UTF_8);
        // HS512 requires key length >= 64 bytes. If secret is shorter, derive a safe-length key.
        if (keyBytes.length < 64) {
            try {
                keyBytes = MessageDigest.getInstance("SHA-512").digest(keyBytes);
            } catch (Exception e) {
                throw new IllegalStateException("Failed to derive JWT signing key", e);
            }
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

