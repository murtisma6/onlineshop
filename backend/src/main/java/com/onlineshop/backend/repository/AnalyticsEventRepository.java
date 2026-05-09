package com.onlineshop.backend.repository;

import com.onlineshop.backend.model.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.jpa.repository.Modifying;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {
    @Modifying
    @Transactional
    void deleteByProductId(Long productId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AnalyticsEvent a WHERE a.product.id = :productId AND a.eventType = :eventType")
    Long countByProductIdAndEventType(@org.springframework.data.repository.query.Param("productId") Long productId, @org.springframework.data.repository.query.Param("eventType") com.onlineshop.backend.model.EventType eventType);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AnalyticsEvent a WHERE a.product.store.id = :storeId AND a.eventType = :eventType")
    Long countByStoreIdAndEventType(@org.springframework.data.repository.query.Param("storeId") Long storeId, @org.springframework.data.repository.query.Param("eventType") com.onlineshop.backend.model.EventType eventType);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    java.util.List<AnalyticsEvent> findTop100ByOrderByTimestampDesc();
}
