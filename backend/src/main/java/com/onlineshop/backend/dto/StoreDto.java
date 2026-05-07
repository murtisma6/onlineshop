package com.onlineshop.backend.dto;

import lombok.Data;

@Data
public class StoreDto {
    private Long id;
    private String name;
    private Long sellerId;
    private int productCount;
    private String uniqueUrl;
    private Long totalViews;
    private Long totalClicks;
    private String ribbonColor;
    private String headerTagline;
    private String logoUrl;
    private java.time.LocalDateTime updatedAt;
}
