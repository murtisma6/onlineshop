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
    private String instagramUrl;
    private String facebookUrl;
    private String youtubeUrl;
    private String leftBannerUrl;
    private String rightBannerUrl;
    private String rollingText;
    private String rollingTextColor;
    private String rollingTextStyle;
    private java.time.LocalDateTime updatedAt;
}
