package com.onlineshop.backend.repository;

import com.onlineshop.backend.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findBySellerId(Long sellerId);
}
