package com.onlineshop.backend.dto;

import com.onlineshop.backend.model.EventType;
import lombok.Data;

@Data
public class AnalyticsRequest {
    private EventType eventType;
    private Long productId;
    private Long userId;
}
