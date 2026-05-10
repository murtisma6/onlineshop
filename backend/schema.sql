-- Database Creation Script for Online Shop
-- Database: onlineshop
-- Target DBMS: PostgreSQL

-- Create Database (Run this manually if not already created)
-- CREATE DATABASE onlineshop;

-- Connect to the database
-- \c onlineshop;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL, -- BUYER, SELLER, ADMIN
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(255),
    whatsapp VARCHAR(255),
    address TEXT,
    city VARCHAR(255),
    pincode VARCHAR(255),
    state VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_otp VARCHAR(255),
    phone_otp VARCHAR(255),
    plan VARCHAR(255) DEFAULT 'STARTER'
);

-- 2. Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    seller_id BIGINT NOT NULL,
    unique_url VARCHAR(255) UNIQUE,
    ribbon_color VARCHAR(255) DEFAULT '#4f46e5',
    header_tagline VARCHAR(255) DEFAULT 'Welcome to our store! Browse our collection below.',
    logo_path VARCHAR(255),
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    youtube_url VARCHAR(255),
    updated_at TIMESTAMP,
    CONSTRAINT fk_stores_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(19, 2) NOT NULL,
    mrp NUMERIC(19, 2),
    hide_price BOOLEAN,
    description TEXT,
    category VARCHAR(255),
    subcategory VARCHAR(255),
    seller_contact VARCHAR(255) NOT NULL,
    store_id BIGINT NOT NULL,
    CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- 4. Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_data BYTEA NOT NULL,
    image_content_type VARCHAR(255) NOT NULL,
    CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    rating INTEGER NOT NULL,
    comment TEXT,
    user_name VARCHAR(255) NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL, -- PRODUCT_VIEW, WHATSAPP_CLICK
    product_id BIGINT NOT NULL,
    user_id BIGINT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id ON analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_stores_seller_id ON stores(seller_id);
