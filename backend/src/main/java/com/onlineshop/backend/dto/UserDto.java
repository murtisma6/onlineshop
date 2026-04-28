package com.onlineshop.backend.dto;

import com.onlineshop.backend.model.Role;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private Role role;
}
