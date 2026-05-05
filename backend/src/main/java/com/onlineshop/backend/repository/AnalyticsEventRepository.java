package com.onlineshop.backend.repository;

import com.onlineshop.backend.model.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.jpa.repository.Modifying;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {
    @Modifying
    @Transactional
    void deleteByProductId(Long productId);
}
