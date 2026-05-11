package com.onlineshop.backend.controller;

import com.onlineshop.backend.dto.ProductDto;
import com.onlineshop.backend.model.Product;
import com.onlineshop.backend.model.ProductImage;
import com.onlineshop.backend.model.User;
import com.onlineshop.backend.model.Store;
import com.onlineshop.backend.repository.AnalyticsEventRepository;
import com.onlineshop.backend.repository.ProductRepository;
import com.onlineshop.backend.repository.ProductImageRepository;
import com.onlineshop.backend.repository.StoreRepository;
import com.onlineshop.backend.repository.UserRepository;
import com.onlineshop.backend.repository.ReviewRepository;
import com.onlineshop.backend.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Value("${app.base-url}")
    private String baseUrl;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private AnalyticsEventRepository analyticsEventRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @PostMapping
    public ResponseEntity<?> uploadProduct(
            @RequestParam("name") String name,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "mrp", required = false) BigDecimal mrp,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("subcategory") String subcategory,
            @RequestParam("sellerContact") String sellerContact,
            @RequestParam("storeId") Long storeId,
            @RequestParam(value = "hidePrice", defaultValue = "false") Boolean hidePrice,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {

        Optional<Store> storeOpt = storeRepository.findById(storeId);
        if (storeOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid store ID");
        }
        Store store = storeOpt.get();
        User seller = store.getSeller();

        // 3-Month Expiry Check
        String plan = seller.getPlan() != null ? seller.getPlan().trim().toUpperCase() : "STARTER";
        if ("STARTER".equals(plan) && seller.getCreatedAt().plusMonths(3).isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Starter plan expired. Please upgrade to Business or Enterprise.");
        }

        // Product Count Limit Check
        long productCount = productRepository.findByStoreId(storeId).size();
        if ("STARTER".equals(plan) && productCount >= 7) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body("Starter plan limit reached (7 products). Please upgrade.");
        } else if ("BUSINESS".equals(plan) && productCount >= 21) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body("Business plan limit reached (21 products each store). Please upgrade.");
        } else if ("ENTERPRISE".equals(plan) && productCount >= 53) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body("Enterprise plan limit reached (53 products each store). Please upgrade.");
        }

        try {
            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setMrp(mrp);
            product.setDescription(description);
            product.setCategory(category);
            product.setSubcategory(subcategory);
            product.setSellerContact(sellerContact);
            product.setHidePrice(hidePrice);
            product.setStore(storeOpt.get());

            productRepository.save(product);
            Store store = storeOpt.get();
            store.setUpdatedAt(java.time.LocalDateTime.now());
            storeRepository.save(store);

            if (images != null && images.length > 0) {
                if (images.length > 5) {
                    return ResponseEntity.badRequest().body("Maximum 5 images allowed");
                }
                for (MultipartFile file : images) {
                    ProductImage pImage = new ProductImage();
                    pImage.setProduct(product);
                    pImage.setImageData(file.getBytes());
                    pImage.setImageContentType(file.getContentType());
                    productImageRepository.save(pImage);
                }
            }

            ProductDto dto = mapToDto(product);
            return ResponseEntity.ok(dto);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process image");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "mrp", required = false) BigDecimal mrp,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("subcategory") String subcategory,
            @RequestParam("sellerContact") String sellerContact,
            @RequestParam(value = "retainedImageIds", required = false) List<Long> retainedImageIds,
            @RequestParam(value = "hidePrice", defaultValue = "false") Boolean hidePrice,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {

        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Product product = productOpt.get();
        User seller = product.getStore().getSeller();

        // 3-Month Expiry Check
        String plan = seller.getPlan() != null ? seller.getPlan().trim().toUpperCase() : "STARTER";
        if ("STARTER".equals(plan) && seller.getCreatedAt().plusMonths(3).isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Starter plan expired. Please upgrade to Business or Enterprise.");
        }

        try {
            Product product = productOpt.get();
            product.setName(name);
            product.setPrice(price);
            product.setMrp(mrp);
            product.setDescription(description);
            product.setCategory(category);
            product.setSubcategory(subcategory);
            product.setSellerContact(sellerContact);
            product.setHidePrice(hidePrice);

            productRepository.save(product);
            Store store = product.getStore();
            store.setUpdatedAt(java.time.LocalDateTime.now());
            storeRepository.save(store); // Update store last updated date

            int retainedCount = retainedImageIds != null ? retainedImageIds.size() : 0;
            int newCount = images != null ? images.length : 0;
            if (retainedCount + newCount > 5) {
                return ResponseEntity.badRequest().body("Maximum 5 images allowed");
            }

            // Remove images that are not in retainedImageIds
            List<ProductImage> existingImages = new java.util.ArrayList<>(product.getImages());
            for (ProductImage img : existingImages) {
                if (retainedImageIds == null || !retainedImageIds.contains(img.getId())) {
                    productImageRepository.delete(img);
                    product.getImages().remove(img);
                }
            }

            // Save new images
            if (images != null) {
                for (MultipartFile file : images) {
                    ProductImage pImage = new ProductImage();
                    pImage.setProduct(product);
                    pImage.setImageData(file.getBytes());
                    pImage.setImageContentType(file.getContentType());
                    productImageRepository.save(pImage);
                }
            }

            // Reload the product to ensure images are fully synchronized before mapping to DTO
            Product updatedProduct = productRepository.findById(id).get();
            ProductDto dto = mapToDto(updatedProduct);
            return ResponseEntity.ok(dto);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process image");
        }
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        List<ProductDto> dtos = products.stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            return ResponseEntity.ok(mapToDto(productOpt.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<ProductDto>> getProductsByStore(@PathVariable Long storeId) {
        List<Product> products = productRepository.findByStoreId(storeId);
        List<ProductDto> dtos = products.stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            // Delete analytics events associated with this product first to avoid constraint violation
            analyticsEventRepository.deleteByProductId(id);
            Store store = productOpt.get().getStore();
            productRepository.delete(productOpt.get());
            store.setUpdatedAt(java.time.LocalDateTime.now());
            storeRepository.save(store); // Update store last updated date
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{productId}/images/{imageId}")
    public ResponseEntity<byte[]> getProductImage(@PathVariable Long productId, @PathVariable Long imageId) {
        Optional<ProductImage> imageOpt = productImageRepository.findById(imageId);
        if (imageOpt.isPresent() && imageOpt.get().getProduct().getId().equals(productId)) {
            ProductImage pImage = imageOpt.get();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, pImage.getImageContentType())
                    .body(pImage.getImageData());
        }
        return ResponseEntity.notFound().build();
    }

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setMrp(product.getMrp());
        dto.setHidePrice(product.getHidePrice());
        dto.setDescription(product.getDescription());
        dto.setCategory(product.getCategory());
        dto.setSubcategory(product.getSubcategory());
        dto.setSellerContact(product.getSellerContact());
        dto.setStoreId(product.getStore().getId());
        dto.setStoreName(product.getStore().getName());
        dto.setStoreUniqueUrl(product.getStore().getUniqueUrl());
        dto.setStoreRibbonColor(product.getStore().getRibbonColor());
        dto.setSellerCity(product.getStore().getSeller().getCity());
        
        String currentBaseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();
        
        List<String> urls = product.getImages().stream()
                .map(img -> currentBaseUrl + "/api/products/" + product.getId() + "/images/" + img.getId())
                .collect(Collectors.toList());
        dto.setImageUrls(urls);

        Long views = analyticsEventRepository.countByProductIdAndEventType(product.getId(), com.onlineshop.backend.model.EventType.PRODUCT_VIEW);
        Long clicks = analyticsEventRepository.countByProductIdAndEventType(product.getId(), com.onlineshop.backend.model.EventType.WHATSAPP_CLICK);
        dto.setViews(views);
        dto.setClicks(clicks);

        if (product.getStore().getLogoData() != null) {
            dto.setStoreLogoUrl(currentBaseUrl + "/api/stores/" + product.getStore().getId() + "/logo");
        }

        List<Review> reviews = reviewRepository.findByProductId(product.getId());
        dto.setReviewCount(reviews.size());
        if (!reviews.isEmpty()) {
            double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            dto.setAverageRating(Math.round(avg * 10.0) / 10.0); // Round to 1 decimal place
        } else {
            dto.setAverageRating(0.0);
        }

        return dto;
    }
}
