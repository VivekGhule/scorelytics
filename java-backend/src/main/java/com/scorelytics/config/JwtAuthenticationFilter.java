package com.scorelytics.config;

import com.scorelytics.entity.User;
import com.scorelytics.repository.UserRepository;
import com.scorelytics.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // If already authenticated, skip.
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        try {
            String userId = jwtService.extractUserId(token);
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }

            User user = userOpt.get();

            // Update last-seen time to support "Active" status in admin UI.
            // Keep it lightweight: only update if missing or stale (>60s).
            Date now = new Date();
            Date lastSeen = user.getLastSeenAt();
            if (lastSeen == null || (now.getTime() - lastSeen.getTime()) > 60_000) {
                user.setLastSeenAt(now);
                userRepository.save(user);
            }

            GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user.getId(), null, List.of(authority));
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception ignored) {
            // Invalid token -> treat as anonymous.
        }

        filterChain.doFilter(request, response);
    }
}

