package com.onlineshop.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long id;
    private int rating;
    private String comment;
    private String userName;
    private LocalDateTime createdAt;
}
