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
@CrossOrigin(origins = {"http://localhost", "http://192.168.0.105"})
public class AdminController {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

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
