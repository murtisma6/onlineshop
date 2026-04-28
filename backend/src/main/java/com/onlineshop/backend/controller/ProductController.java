package com.onlineshop.backend.controller;

import com.onlineshop.backend.dto.ProductDto;
import com.onlineshop.backend.model.Product;
import com.onlineshop.backend.model.User;
import com.onlineshop.backend.repository.ProductRepository;
import com.onlineshop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> uploadProduct(
            @RequestParam("name") String name,
            @RequestParam("price") BigDecimal price,
            @RequestParam("sellerContact") String sellerContact,
            @RequestParam("sellerId") Long sellerId,
            @RequestParam("image") MultipartFile image) {

        Optional<User> sellerOpt = userRepository.findById(sellerId);
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid seller ID");
        }

        try {
            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setSellerContact(sellerContact);
            product.setSeller(sellerOpt.get());
            product.setImageData(image.getBytes());
            product.setImageContentType(image.getContentType());

            productRepository.save(product);

            ProductDto dto = mapToDto(product);
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

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getProductImage(@PathVariable Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, product.getImageContentType())
                    .body(product.getImageData());
        }
        return ResponseEntity.notFound().build();
    }

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setSellerContact(product.getSellerContact());
        dto.setSellerId(product.getSeller().getId());
        dto.setImageUrl("http://localhost:8080/api/products/" + product.getId() + "/image");
        return dto;
    }
}
