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
    private java.util.List<String> imageUrls;
}
