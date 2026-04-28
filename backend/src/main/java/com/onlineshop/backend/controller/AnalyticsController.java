package com.onlineshop.backend.controller;

import com.onlineshop.backend.dto.AnalyticsRequest;
import com.onlineshop.backend.model.AnalyticsEvent;
import com.onlineshop.backend.model.Product;
import com.onlineshop.backend.model.User;
import com.onlineshop.backend.repository.AnalyticsEventRepository;
import com.onlineshop.backend.repository.ProductRepository;
import com.onlineshop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> trackEvent(@RequestBody AnalyticsRequest request) {
        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        if (productOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid product ID");
        }

        AnalyticsEvent event = new AnalyticsEvent();
        event.setEventType(request.getEventType());
        event.setProduct(productOpt.get());

        if (request.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(request.getUserId());
            userOpt.ifPresent(event::setUser);
        }

        analyticsEventRepository.save(event);
        return ResponseEntity.ok().build();
    }
}
