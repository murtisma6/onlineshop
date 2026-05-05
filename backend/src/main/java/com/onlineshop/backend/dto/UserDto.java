package com.onlineshop.backend.dto;

import com.onlineshop.backend.model.Role;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private Role role;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String whatsapp;
    private String address;
    private String city;
    private String pincode;
    private String state;
    private boolean emailVerified;
    private boolean phoneVerified;
}
