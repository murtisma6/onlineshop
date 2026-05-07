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
@CrossOrigin(origins = {"http://localhost", "${app.frontend-url}"})
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
            @RequestParam(value = "logo", required = false) MultipartFile logo) {
        
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

        if (logo != null && !logo.isEmpty()) {
            try {
                String uploadDir = "uploads/stores/" + id + "/";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String fileName = "logo_" + System.currentTimeMillis() + "_" + logo.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(logo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                store.setLogoPath(uploadDir + fileName);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload logo");
            }
        }

        store.setUpdatedAt(java.time.LocalDateTime.now());
        storeRepository.save(store);
        return ResponseEntity.ok(mapToDto(store));
    }

    @GetMapping("/{id}/logo")
    public ResponseEntity<Resource> getStoreLogo(@PathVariable Long id) {
        Optional<Store> storeOpt = storeRepository.findById(id);
        if (storeOpt.isPresent() && storeOpt.get().getLogoPath() != null) {
            try {
                Path path = Paths.get(storeOpt.get().getLogoPath());
                Resource resource = new UrlResource(path.toUri());
                if (resource.exists()) {
                    return ResponseEntity.ok()
                            .contentType(MediaType.IMAGE_JPEG)
                            .body(resource);
                }
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
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
        
        if (s.getLogoPath() != null) {
            dto.setLogoUrl(baseUrl + "/api/stores/" + s.getId() + "/logo");
        }

        Long views = analyticsEventRepository.countByStoreIdAndEventType(s.getId(), com.onlineshop.backend.model.EventType.PRODUCT_VIEW);
        Long clicks = analyticsEventRepository.countByStoreIdAndEventType(s.getId(), com.onlineshop.backend.model.EventType.WHATSAPP_CLICK);
        dto.setTotalViews(views);
        dto.setTotalClicks(clicks);
        dto.setUpdatedAt(s.getUpdatedAt());
        
        return dto;
    }


    @DeleteMapping("/{id}/logo")
    public ResponseEntity<?> deleteStoreLogo(@PathVariable Long id) {
        Optional<Store> storeOpt = storeRepository.findById(id);
        if (storeOpt.isPresent()) {
            Store store = storeOpt.get();
            if (store.getLogoPath() != null) {
                try {
                    Files.deleteIfExists(Paths.get(store.getLogoPath()));
                    store.setLogoPath(null);
                    storeRepository.save(store);
                    return ResponseEntity.ok(mapToDto(store));
                } catch (IOException e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete logo file");
                }
            }
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
