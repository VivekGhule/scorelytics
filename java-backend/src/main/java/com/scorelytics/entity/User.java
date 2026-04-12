package com.scorelytics.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.util.Date;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    private String email;

    private String password;

    private String name;

    private String photoUrl;

    private String gender;

    private String phone;

    private String location;

    private Education education;

    private Role role;

    private Date createdAt;

    /**
     * Updated whenever the user makes an authenticated request.
     * Used to show "Active" status in the admin UI.
     */
    private Date lastSeenAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Education {
        private String college;
        private String degree;
        private String specialization;
        private String graduationYear;
    }

    public enum Role {
        USER, ADMIN
    }
}
