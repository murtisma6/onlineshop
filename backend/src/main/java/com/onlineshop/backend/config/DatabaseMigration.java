package com.onlineshop.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigration implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Running database migration check...");
        try {
            // Check if column exists
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(255) DEFAULT 'STARTER'");
            System.out.println("Migration successful: 'plan' column checked/added.");
        } catch (Exception e) {
            System.err.println("Migration error: " + e.getMessage());
        }
    }
}
