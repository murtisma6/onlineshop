package com.onlineshop.backend.repository;

import com.onlineshop.backend.model.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {
}
