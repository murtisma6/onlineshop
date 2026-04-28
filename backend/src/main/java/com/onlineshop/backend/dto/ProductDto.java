package com.onlineshop.backend.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class ProductDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private String sellerContact;
    private Long sellerId;
    private String imageUrl;
}
