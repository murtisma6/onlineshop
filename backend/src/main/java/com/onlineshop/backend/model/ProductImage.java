package com.onlineshop.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "product_images")
@Data
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "image_data", columnDefinition="BYTEA", nullable = false)
    private byte[] imageData;

    @Column(nullable = false)
    private String imageContentType;
}
