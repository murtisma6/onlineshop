package com.onlineshop.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "stores")
@Data
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Product> products = new java.util.ArrayList<>();

    @Column(unique = true)
    private String uniqueUrl;

    @Column
    private String ribbonColor = "#4f46e5"; // Default Indigo

    @Column
    private String headerTagline = "Welcome to our store! Browse our collection below.";

    @Column
    private String logoPath;

    @Column
    private String instagramUrl;

    @Column
    private String facebookUrl;

    @Column
    private String youtubeUrl;

    @Column
    @org.hibernate.annotations.UpdateTimestamp
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    public void generateUniqueUrl() {
        if (this.uniqueUrl == null || this.uniqueUrl.isEmpty()) {
            this.uniqueUrl = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toLowerCase();
        }
    }
}
