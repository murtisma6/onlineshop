package com.onlineshop.backend.dto;

import com.onlineshop.backend.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
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
    private String country;
}
