package com.onlineshop.backend.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class ProductDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private String description;
    private String category;
    private String subcategory;
    private String sellerContact;
    private Long storeId;
    private String storeName;
    private String storeUniqueUrl;
    private java.util.List<String> imageUrls;
    private Long views;
    private Long clicks;
    private String sellerCity;
    private String storeLogoUrl;
    private Double averageRating;
    private Integer reviewCount;
}
