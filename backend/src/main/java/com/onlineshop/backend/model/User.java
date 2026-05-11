package com.onlineshop.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column
    private String firstName;

    @Column
    private String lastName;

    @Column(unique = true)
    private String email;

    @Column
    private String phone;

    @Column
    private String whatsapp;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column
    private String city;

    @Column
    private String pincode;

    @Column
    private String state;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = false)
    private boolean phoneVerified = false;

    @Column
    private String emailOtp;

    @Column
    private String phoneOtp;

    @Column(name = "plan", length = 255)
    private String plan = "STARTER";

    @Column
    private String country;

    @Column(nullable = false, updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
}
