package com.onlineshop.backend.controller;

import com.onlineshop.backend.dto.StoreDto;
import com.onlineshop.backend.model.Store;
import com.onlineshop.backend.model.User;
import com.onlineshop.backend.model.Product;
import com.onlineshop.backend.repository.StoreRepository;
import com.onlineshop.backend.repository.UserRepository;
import com.onlineshop.backend.repository.AnalyticsEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Value("${app.base-url}")
    private String baseUrl;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

    @PostMapping
    public ResponseEntity<?> createStore(@RequestBody StoreDto storeDto) {
        Optional<User> sellerOpt = userRepository.findById(storeDto.getSellerId());
        if (!sellerOpt.isPresent() || !sellerOpt.get().getRole().name().equals("SELLER")) {
            return ResponseEntity.badRequest().body("Invalid seller");
        }

        Store store = new Store();
        store.setName(storeDto.getName());
        store.setSeller(sellerOpt.get());
        storeRepository.save(store);

        StoreDto responseDto = new StoreDto();
        responseDto.setId(store.getId());
        responseDto.setName(store.getName());
        responseDto.setSellerId(store.getSeller().getId());
        responseDto.setProductCount(0);
        responseDto.setUniqueUrl(store.getUniqueUrl());
        responseDto.setRibbonColor(store.getRibbonColor());
        responseDto.setHeaderTagline(store.getHeaderTagline());

        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<StoreDto>> getStoresBySeller(@PathVariable Long sellerId) {
        List<Store> stores = storeRepository.findBySellerId(sellerId);
        List<StoreDto> dtos = stores.stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }


    @GetMapping("/url/{uniqueUrl}")
    public ResponseEntity<StoreDto> getStoreByUniqueUrl(@PathVariable String uniqueUrl) {
        return storeRepository.findByUniqueUrl(uniqueUrl)
                .map(s -> ResponseEntity.ok(mapToDto(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStore(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "ribbonColor", required = false) String ribbonColor,
            @RequestParam(value = "headerTagline", required = false) String headerTagline,
            @RequestParam(value = "instagramUrl", required = false) String instagramUrl,
            @RequestParam(value = "facebookUrl", required = false) String facebookUrl,
            @RequestParam(value = "youtubeUrl", required = false) String youtubeUrl,
            @RequestParam(value = "rollingText", required = false) String rollingText,
            @RequestParam(value = "rollingTextColor", required = false) String rollingTextColor,
            @RequestParam(value = "rollingTextStyle", required = false) String rollingTextStyle,
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam(value = "leftBanner", required = false) MultipartFile leftBanner,
            @RequestParam(value = "rightBanner", required = false) MultipartFile rightBanner) {
        
        Optional<Store> storeOpt = storeRepository.findById(id);
        if (!storeOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Store store = storeOpt.get();
        if (name != null && !name.isEmpty()) {
            store.setName(name);
        }
        if (ribbonColor != null) {
            store.setRibbonColor(ribbonColor);
        }
        if (headerTagline != null) {
            store.setHeaderTagline(headerTagline);
        }
        if (instagramUrl != null) {
            store.setInstagramUrl(instagramUrl);
        }
        if (facebookUrl != null) {
            store.setFacebookUrl(facebookUrl);
        }
        if (youtubeUrl != null) {
            store.setYoutubeUrl(youtubeUrl);
        }
        if (rollingText != null) {
            store.setRollingText(rollingText);
        }
        if (rollingTextColor != null) {
            store.setRollingTextColor(rollingTextColor);
        }
        if (rollingTextStyle != null) {
            store.setRollingTextStyle(rollingTextStyle);
        }

        if (logo != null && !logo.isEmpty()) {
            try {
                store.setLogoData(logo.getBytes());
                store.setLogoType(logo.getContentType());
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process logo");
            }
        }

        if (leftBanner != null && !leftBanner.isEmpty()) {
            try {
                store.setLeftBannerData(leftBanner.getBytes());
                store.setLeftBannerType(leftBanner.getContentType());
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process left banner");
            }
        }

        if (rightBanner != null && !rightBanner.isEmpty()) {
            try {
                store.setRightBannerData(rightBanner.getBytes());
                store.setRightBannerType(rightBanner.getContentType());
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process right banner");
            }
        }

        store.setUpdatedAt(java.time.LocalDateTime.now());
        storeRepository.save(store);
        return ResponseEntity.ok(mapToDto(store));
    }

    @GetMapping("/{id}/logo")
    public ResponseEntity<Resource> getStoreLogo(@PathVariable Long id) {
        return getStoreImage(id, "logo");
    }

    @GetMapping("/{id}/left-banner")
    public ResponseEntity<Resource> getLeftBanner(@PathVariable Long id) {
        return getStoreImage(id, "left-banner");
    }

    @GetMapping("/{id}/right-banner")
    public ResponseEntity<Resource> getRightBanner(@PathVariable Long id) {
        return getStoreImage(id, "right-banner");
    }

    private ResponseEntity<Resource> getStoreImage(Long id, String type) {
        Optional<Store> storeOpt = storeRepository.findById(id);
        if (storeOpt.isPresent()) {
            Store store = storeOpt.get();
            byte[] data = null;
            String contentType = null;

            if ("logo".equals(type)) {
                data = store.getLogoData();
                contentType = store.getLogoType();
            } else if ("left-banner".equals(type)) {
                data = store.getLeftBannerData();
                contentType = store.getLeftBannerType();
            } else if ("right-banner".equals(type)) {
                data = store.getRightBannerData();
                contentType = store.getRightBannerType();
            }

            if (data != null && contentType != null) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(new org.springframework.core.io.ByteArrayResource(data));
            }
        }
        return ResponseEntity.notFound().build();
    }

    private StoreDto mapToDto(Store s) {
        StoreDto dto = new StoreDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setSellerId(s.getSeller().getId());
        dto.setProductCount(s.getProducts().size());
        dto.setUniqueUrl(s.getUniqueUrl());
        dto.setRibbonColor(s.getRibbonColor());
        dto.setHeaderTagline(s.getHeaderTagline());
        
        String currentBaseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();
        
        if (s.getLogoData() != null) {
            dto.setLogoUrl(currentBaseUrl + "/api/stores/" + s.getId() + "/logo");
        }
        if (s.getLeftBannerData() != null) {
            dto.setLeftBannerUrl(currentBaseUrl + "/api/stores/" + s.getId() + "/left-banner");
        }
        if (s.getRightBannerData() != null) {
            dto.setRightBannerUrl(currentBaseUrl + "/api/stores/" + s.getId() + "/right-banner");
        }

        dto.setInstagramUrl(s.getInstagramUrl());
        dto.setFacebookUrl(s.getFacebookUrl());
        dto.setYoutubeUrl(s.getYoutubeUrl());
        dto.setRollingText(s.getRollingText());
        dto.setRollingTextColor(s.getRollingTextColor());
        dto.setRollingTextStyle(s.getRollingTextStyle());

        Long views = analyticsEventRepository.countByStoreIdAndEventType(s.getId(), com.onlineshop.backend.model.EventType.PRODUCT_VIEW);
        Long clicks = analyticsEventRepository.countByStoreIdAndEventType(s.getId(), com.onlineshop.backend.model.EventType.WHATSAPP_CLICK);
        dto.setTotalViews(views);
        dto.setTotalClicks(clicks);
        dto.setUpdatedAt(s.getUpdatedAt());
        
        return dto;
    }


    @DeleteMapping("/{id}/logo")
    public ResponseEntity<?> deleteStoreLogo(@PathVariable Long id) {
        return deleteStoreImage(id, "logo");
    }

    @DeleteMapping("/{id}/left-banner")
    public ResponseEntity<?> deleteLeftBanner(@PathVariable Long id) {
        return deleteStoreImage(id, "left-banner");
    }

    @DeleteMapping("/{id}/right-banner")
    public ResponseEntity<?> deleteRightBanner(@PathVariable Long id) {
        return deleteStoreImage(id, "right-banner");
    }

    private ResponseEntity<?> deleteStoreImage(Long id, String type) {
        Optional<Store> storeOpt = storeRepository.findById(id);
        if (storeOpt.isPresent()) {
            Store store = storeOpt.get();
            if ("logo".equals(type)) {
                store.setLogoData(null);
                store.setLogoType(null);
            } else if ("left-banner".equals(type)) {
                store.setLeftBannerData(null);
                store.setLeftBannerType(null);
            } else if ("right-banner".equals(type)) {
                store.setRightBannerData(null);
                store.setRightBannerType(null);
            }
            
            storeRepository.save(store);
            return ResponseEntity.ok(mapToDto(store));
        }
        return ResponseEntity.notFound().build();
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStore(@PathVariable Long id) {
        Optional<Store> storeOpt = storeRepository.findById(id);
        if (storeOpt.isPresent()) {
            Store store = storeOpt.get();
            // Delete analytics events associated with all products in this store
            for (Product product : store.getProducts()) {
                analyticsEventRepository.deleteByProductId(product.getId());
            }
            // Delete the store, which will cascade and delete all products and images
            storeRepository.delete(store);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
