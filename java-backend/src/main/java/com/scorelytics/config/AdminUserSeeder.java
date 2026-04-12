package com.scorelytics.config;

import com.scorelytics.entity.User;
import com.scorelytics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;

@Configuration
@RequiredArgsConstructor
public class AdminUserSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:vivekghule777@gmail.com}")
    private String adminEmail;

    @Value("${admin.password:Pass123}")
    private String adminPassword;

    @Value("${admin.name:Vivek Admin}")
    private String adminName;

    @Bean
    CommandLineRunner seedAdminUser() {
        return args -> {
            if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
                return;
            }

            User user = userRepository.findByEmail(adminEmail).orElseGet(User::new);

            boolean isNew = (user.getId() == null);
            user.setEmail(adminEmail);
            user.setName((user.getName() == null || user.getName().isBlank()) ? adminName : user.getName());
            user.setRole(User.Role.ADMIN);
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(new Date());
            }

            // Always set password to the configured admin password.
            user.setPassword(passwordEncoder.encode(adminPassword));

            userRepository.save(user);

            if (isNew) {
                System.out.println("[seed] Admin user created: " + adminEmail);
            } else {
                System.out.println("[seed] Admin user updated (role/password ensured): " + adminEmail);
            }
        };
    }
}

