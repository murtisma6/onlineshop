package com.onlineshop.backend.dto;

import com.onlineshop.backend.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private Role role;
}
