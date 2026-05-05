package com.onlineshop.backend.repository;

import com.onlineshop.backend.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findBySellerId(Long sellerId);
    Optional<Store> findByUniqueUrl(String uniqueUrl);
}
