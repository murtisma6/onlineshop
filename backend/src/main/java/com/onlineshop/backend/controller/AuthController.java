package com.onlineshop.backend.controller;

import com.onlineshop.backend.dto.LoginRequest;
import com.onlineshop.backend.dto.RegisterRequest;
import com.onlineshop.backend.dto.UserDto;
import com.onlineshop.backend.model.Role;
import com.onlineshop.backend.model.User;
import com.onlineshop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(request.getPassword()); 
        user.setRole(request.getRole());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setWhatsapp(request.getWhatsapp());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setPincode(request.getPincode());
        user.setState(request.getState());
        
        userRepository.save(user);
        
        return ResponseEntity.ok(mapToDto(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isPresent() && userOpt.get().getPasswordHash().equals(request.getPassword())) {
            return ResponseEntity.ok(mapToDto(userOpt.get()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam Long userId, @RequestParam String type) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        
        if ("email".equalsIgnoreCase(type)) {
            user.setEmailOtp(otp);
            System.out.println(">>> [MOCK EMAIL] To: " + user.getEmail() + " | OTP: " + otp);
        } else if ("phone".equalsIgnoreCase(type)) {
            user.setPhoneOtp(otp);
            System.out.println(">>> [MOCK SMS] To: " + user.getPhone() + " | OTP: " + otp);
        } else {
            return ResponseEntity.badRequest().body("Invalid type");
        }
        userRepository.save(user);
        return ResponseEntity.ok("OTP sent");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam Long userId, @RequestParam String type, @RequestParam String otp) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        
        if ("email".equalsIgnoreCase(type)) {
            if (otp.equals(user.getEmailOtp())) {
                user.setEmailVerified(true);
                user.setEmailOtp(null);
            } else {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }
        } else if ("phone".equalsIgnoreCase(type)) {
            if (otp.equals(user.getPhoneOtp())) {
                user.setPhoneVerified(true);
                user.setPhoneOtp(null);
            } else {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }
        } else {
            return ResponseEntity.badRequest().body("Invalid type");
        }
        userRepository.save(user);
        return ResponseEntity.ok(mapToDto(user));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(mapToDto(userOpt.get()));
    }

    @PostMapping("/make-admin/{id}")
    public ResponseEntity<?> makeAdmin(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(Role.ADMIN);
            userRepository.save(user);
            return ResponseEntity.ok(mapToDto(user));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDto request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        
        // Only allow updating email if not verified
        if (!user.isEmailVerified() && request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        
        // Only allow updating phone if not verified
        if (!user.isPhoneVerified() && request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        
        // Other fields can be updated
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getWhatsapp() != null) user.setWhatsapp(request.getWhatsapp());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getPincode() != null) user.setPincode(request.getPincode());
        if (request.getState() != null) user.setState(request.getState());
        
        userRepository.save(user);
        return ResponseEntity.ok(mapToDto(user));
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setWhatsapp(user.getWhatsapp());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setPincode(user.getPincode());
        dto.setState(user.getState());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setPhoneVerified(user.isPhoneVerified());
        return dto;
    }
}
