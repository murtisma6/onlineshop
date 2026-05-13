package com.onlineshop.backend.controller;

import com.onlineshop.backend.model.Promotion;
import com.onlineshop.backend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    // Public endpoint for buyers
    @GetMapping("/active")
    public List<Promotion> getActivePromotions() {
        return promotionRepository.findByActiveOrderByOrderIndexAsc(true);
    }

    // Endpoint to serve promotion images
    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getPromotionImage(@PathVariable Long id) {
        Optional<Promotion> opt = promotionRepository.findById(id);
        if (opt.isPresent() && opt.get().getImageData() != null) {
            Promotion promo = opt.get();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, promo.getImageContentType())
                    .body(promo.getImageData());
        }
        return ResponseEntity.notFound().build();
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAllByOrderByOrderIndexAsc();
    }

    @PostMapping("/admin")
    public ResponseEntity<?> createOrUpdatePromotion(
            @RequestParam(value = "id", required = false) Long id,
            @RequestParam("title") String title,
            @RequestParam("subtitle") String subtitle,
            @RequestParam("buttonText") String buttonText,
            @RequestParam("buttonLink") String buttonLink,
            @RequestParam("backgroundColor") String backgroundColor,
            @RequestParam("textColor") String textColor,
            @RequestParam("active") boolean active,
            @RequestParam("orderIndex") int orderIndex,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        Promotion promotion;
        if (id != null) {
            Optional<Promotion> opt = promotionRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.notFound().build();
            promotion = opt.get();
        } else {
            promotion = new Promotion();
        }

        promotion.setTitle(title);
        promotion.setSubtitle(subtitle);
        promotion.setButtonText(buttonText);
        promotion.setButtonLink(buttonLink);
        promotion.setBackgroundColor(backgroundColor);
        promotion.setTextColor(textColor);
        promotion.setActive(active);
        promotion.setOrderIndex(orderIndex);

        if (image != null && !image.isEmpty()) {
            promotion.setImageData(image.getBytes());
            promotion.setImageContentType(image.getContentType());
        }

        promotionRepository.save(promotion);
        return ResponseEntity.ok(promotion);
    }
    
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        promotionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
