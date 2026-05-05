package com.onlineshop.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AnalyticsEventDto {
    private Long id;
    private String eventType;
    private String productName;
    private String storeName;
    private String username;
    private LocalDateTime timestamp;
}
