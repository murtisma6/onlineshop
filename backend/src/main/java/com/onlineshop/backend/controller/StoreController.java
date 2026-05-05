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

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stores")
@CrossOrigin(origins = "http://localhost:5173")
public class StoreController {

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

        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<StoreDto>> getStoresBySeller(@PathVariable Long sellerId) {
        List<Store> stores = storeRepository.findBySellerId(sellerId);
        List<StoreDto> dtos = stores.stream().map(s -> {
            StoreDto dto = new StoreDto();
            dto.setId(s.getId());
            dto.setName(s.getName());
            dto.setSellerId(s.getSeller().getId());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
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
