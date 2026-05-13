package com.onlineshop.backend.repository;

import com.onlineshop.backend.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByActiveOrderByOrderIndexAsc(boolean active);
    List<Promotion> findAllByOrderByOrderIndexAsc();
}
