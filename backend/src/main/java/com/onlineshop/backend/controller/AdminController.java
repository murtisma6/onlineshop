package com.onlineshop.backend.controller;

import com.onlineshop.backend.dto.AnalyticsEventDto;
import com.onlineshop.backend.dto.StoreDto;
import com.onlineshop.backend.model.AnalyticsEvent;
import com.onlineshop.backend.model.Role;
import com.onlineshop.backend.model.Store;
import com.onlineshop.backend.model.User;
import com.onlineshop.backend.repository.AnalyticsEventRepository;
import com.onlineshop.backend.repository.StoreRepository;
import com.onlineshop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

    @Autowired
    private com.onlineshop.backend.repository.ReviewRepository reviewRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        // System Health
        Runtime runtime = Runtime.getRuntime();
        long totalMem = runtime.totalMemory();
        long freeMem = runtime.freeMemory();
        
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("usedMemory", totalMem - freeMem);
        health.put("totalMemory", totalMem);
        health.put("freeMemory", freeMem);
        
        // Stores aggregation
        List<Store> stores = storeRepository.findAll();
        List<StoreDto> storeDtos = stores.stream().map(s -> {
            StoreDto dto = new StoreDto();
            dto.setId(s.getId());
            dto.setName(s.getName());
            dto.setSellerId(s.getSeller().getId());
            dto.setProductCount(s.getProducts().size());
            dto.setUniqueUrl(s.getUniqueUrl());
            
            Long views = analyticsEventRepository.countByStoreIdAndEventType(s.getId(), com.onlineshop.backend.model.EventType.PRODUCT_VIEW);
            Long clicks = analyticsEventRepository.countByStoreIdAndEventType(s.getId(), com.onlineshop.backend.model.EventType.WHATSAPP_CLICK);
            dto.setTotalViews(views);
            dto.setTotalClicks(clicks);
            
            return dto;
        }).collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("health", health);
        response.put("stores", storeDtos);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/traffic")
    public ResponseEntity<List<AnalyticsEventDto>> getRecentTraffic() {
        List<AnalyticsEvent> events = analyticsEventRepository.findTop100ByOrderByTimestampDesc();
        List<AnalyticsEventDto> dtos = events.stream().map(e -> {
            AnalyticsEventDto dto = new AnalyticsEventDto();
            dto.setId(e.getId());
            dto.setEventType(e.getEventType().name());
            dto.setProductName(e.getProduct().getName());
            dto.setStoreName(e.getProduct().getStore().getName());
            dto.setUsername(e.getUser() != null ? e.getUser().getUsername() : "Anonymous");
            dto.setTimestamp(e.getTimestamp());
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/users/bulk")
    public ResponseEntity<?> createBulkUsers(@RequestBody List<User> users) {
        int createdCount = 0;
        for (User user : users) {
            if (userRepository.findByUsername(user.getUsername()).isEmpty() && userRepository.findByEmail(user.getEmail()).isEmpty()) {
                user.setPasswordHash(user.getPasswordHash() != null ? user.getPasswordHash() : "password123");
                if (user.getRole() == null) {
                    user.setRole(Role.BUYER);
                }
                user.setEmailVerified(true);
                user.setPhoneVerified(true);
                userRepository.save(user);
                createdCount++;
            }
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully created " + createdCount + " users.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stores/bulk")
    public ResponseEntity<?> createBulkStores(@RequestBody List<StoreDto> storeDtos) {
        int createdCount = 0;
        for (StoreDto dto : storeDtos) {
            if (dto.getSellerId() != null && dto.getName() != null) {
                Optional<User> sellerOpt = userRepository.findById(dto.getSellerId());
                if (sellerOpt.isPresent() && sellerOpt.get().getRole() == Role.SELLER) {
                    Store store = new Store();
                    store.setName(dto.getName());
                    store.setSeller(sellerOpt.get());
                    store.setUniqueUrl(java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toLowerCase());
                    storeRepository.save(store);
                    createdCount++;
                }
            }
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully created " + createdCount + " stores.");
        return ResponseEntity.ok(response);
    }
    @GetMapping("/users")
    public ResponseEntity<List<com.onlineshop.backend.dto.UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<com.onlineshop.backend.dto.UserDto> dtos = users.stream().map(this::mapUserToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody com.onlineshop.backend.dto.UserDto dto) {
        String username = dto.getUsername();
        if (username == null || !username.matches("^[a-zA-Z0-9_]+$")) {
            return ResponseEntity.badRequest().body("Username can only contain letters, numbers, and underscores (_). Spaces and other special characters are not allowed.");
        }

        // Email validation
        if (dto.getEmail() != null && !dto.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return ResponseEntity.badRequest().body("Please enter a valid email address.");
        }

        // Phone validation (10 digits)
        if (dto.getPhone() != null && !dto.getPhone().matches("^\\d{10}$")) {
            return ResponseEntity.badRequest().body("Phone number must be exactly 10 digits.");
        }
        if (dto.getWhatsapp() != null && !dto.getWhatsapp().matches("^\\d{10}$")) {
            return ResponseEntity.badRequest().body("WhatsApp number must be exactly 10 digits.");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPasswordHash("password123"); // Default password
        user.setRole(dto.getRole());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setWhatsapp(dto.getWhatsapp());
        user.setAddress(dto.getAddress());
        user.setCity(dto.getCity());
        user.setPincode(dto.getPincode());
        user.setState(dto.getState());
        user.setCountry(dto.getCountry());
        user.setEmailVerified(true);
        user.setPhoneVerified(true);
        if (dto.getPlan() != null) {
            user.setPlan(dto.getPlan());
        }
        if (dto.getSubscriptionEndDate() != null) {
            user.setSubscriptionEndDate(dto.getSubscriptionEndDate());
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(mapUserToDto(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody com.onlineshop.backend.dto.UserDto dto) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();

        // Email validation
        if (dto.getEmail() != null && !dto.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return ResponseEntity.badRequest().body("Please enter a valid email address.");
        }

        // Phone validation (10 digits)
        if (dto.getPhone() != null && !dto.getPhone().matches("^\\d{10}$")) {
            return ResponseEntity.badRequest().body("Phone number must be exactly 10 digits.");
        }
        if (dto.getWhatsapp() != null && !dto.getWhatsapp().matches("^\\d{10}$")) {
            return ResponseEntity.badRequest().body("WhatsApp number must be exactly 10 digits.");
        }
        
        user.setRole(dto.getRole());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setWhatsapp(dto.getWhatsapp());
        user.setAddress(dto.getAddress());
        user.setCity(dto.getCity());
        user.setPincode(dto.getPincode());
        user.setState(dto.getState());
        user.setCountry(dto.getCountry());
        if (dto.getPlan() != null) {
            user.setPlan(dto.getPlan());
        }
        if (dto.getSubscriptionEndDate() != null) {
            user.setSubscriptionEndDate(dto.getSubscriptionEndDate());
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(mapUserToDto(user));
    }

    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        
        // 1. Cleanup Analytics Events (linked to user)
        analyticsEventRepository.deleteByUserId(id);
        
        // 2. Handle associated stores if user is seller
        List<Store> stores = storeRepository.findBySellerId(id);
        for (Store store : stores) {
            // Delete reviews for each product in the store
            for (com.onlineshop.backend.model.Product product : store.getProducts()) {
                reviewRepository.deleteByProductId(product.getId());
                analyticsEventRepository.deleteByProductId(product.getId());
            }
            storeRepository.delete(store);
        }
        
        userRepository.delete(user);
        return ResponseEntity.ok("User and all associated data deleted successfully");
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        
        String newPassword = request.get("password");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }
        
        user.setPasswordHash(newPassword);
        userRepository.save(user);
        return ResponseEntity.ok("Password reset successfully");
    }

    private com.onlineshop.backend.dto.UserDto mapUserToDto(User user) {
        com.onlineshop.backend.dto.UserDto dto = new com.onlineshop.backend.dto.UserDto();
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
        dto.setCountry(user.getCountry());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setPhoneVerified(user.isPhoneVerified());
        dto.setPlan(user.getPlan());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setSubscriptionEndDate(user.getSubscriptionEndDate());
        return dto;
    }

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @PostMapping("/fix-db")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> fixDb() {
        try {
            entityManager.createNativeQuery("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;").executeUpdate();
            return ResponseEntity.ok("Constraint dropped!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
