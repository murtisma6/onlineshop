package com.onlineshop.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Data
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String subtitle;
    private String buttonText;
    private String buttonLink;
    private String backgroundColor; // Hex code
    private String textColor; // Hex code

    private String imageContentType;
    
    @Column
    private String imagePath;
    
    private boolean active = true;
    private int orderIndex = 0;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
