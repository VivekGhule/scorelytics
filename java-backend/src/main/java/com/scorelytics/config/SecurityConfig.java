package com.scorelytics.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            // This API uses JWT (no sessions, no form login).
            // Disabling defaults avoids surprising 401/403 behavior for API clients.
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()
                .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasAnyRole("USER", "ADMIN")
                // Public read access
                .requestMatchers(HttpMethod.GET, "/api/questions/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tests/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/results/**").permitAll()

                // Admin CRUD for question/test management
                .requestMatchers(HttpMethod.POST, "/api/questions/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/questions/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/questions/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/tests/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/tests/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/tests/**").hasRole("ADMIN")

                // Authenticated users can submit results; reads are public
                .requestMatchers(HttpMethod.POST, "/api/results/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/results/**").permitAll()
                .requestMatchers("/health", "/actuator/**").permitAll()
                .anyRequest().authenticated()
            );
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(java.util.Arrays.asList(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://localhost:*",
            "https://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
