# Functional Test Cases - Online Shop Application

This document outlines the functional test cases for the Online Shop application, covering Authentication, Buyer features, Seller features, and Admin management.

---

## 1. Authentication & Security

### 1.1 User Registration
| ID | Test Case | Expected Result |
|---|---|---|
| AUTH_01 | Register with valid details | User is registered and redirected to the verification/account page. |
| AUTH_02 | Register with a username containing spaces | Error: "Username can only contain letters, numbers, and underscores (_)." |
| AUTH_03 | Register with a username containing special characters (e.g., @, !, #) | Error: "Username can only contain letters, numbers, and underscores (_)." |
| AUTH_04 | Register with an existing username | Error: "Username already exists." |
| AUTH_05 | Register with an invalid email format (e.g., "test@com") | Error: "Please enter a valid email address." |
| AUTH_06 | Register with a phone number != 10 digits | Error: "Phone number must be exactly 10 digits." |
| AUTH_07 | Register with a WhatsApp number != 10 digits | Error: "WhatsApp number must be exactly 10 digits." |

### 1.2 User Login
| ID | Test Case | Expected Result |
|---|---|---|
| AUTH_08 | Login with valid credentials | User is logged in and redirected to appropriate home page (Buyer/Seller/Admin). |
| AUTH_09 | Login with incorrect password | Error: "Invalid credentials." |
| AUTH_10 | Login with non-existent username | Error: "Invalid credentials." |
| AUTH_11 | Login with invalid username format (e.g., "user name") | Error message regarding character restrictions is displayed. |

### 1.3 OTP Verification
| ID | Test Case | Expected Result |
|---|---|---|
| AUTH_12 | Request Email OTP | Mock email OTP is logged in backend console; user is prompted to enter it. |
| AUTH_13 | Verify correct Email OTP | Email is marked as verified in the database. |
| AUTH_14 | Request Phone OTP | Mock SMS OTP is logged in backend console. |
| AUTH_15 | Verify correct Phone OTP | Phone number is marked as verified. |

---

## 2. Seller Module

### 2.1 Store Management
| ID | Test Case | Expected Result |
|---|---|---|
| SELL_01 | Create a new store | Store is created and appears in the seller's "My Stores" list. |
| SELL_02 | Create multiple stores on Starter Plan | Error/Alert: "Starter plan limit reached (1 store)." |
| SELL_03 | Update store ribbon color | Color update is reflected in the store preview. |
| SELL_04 | Upload store logo (> 300KB) | Error: "Logo file size exceeds 300KB limit." |
| SELL_05 | Upload store logo (<= 300KB) | Logo is successfully uploaded and displayed. |
| SELL_06 | Delete store logo | Logo is removed and placeholder is shown. |
| SELL_07 | Update store tagline/welcome message | Tagline is updated on the store's public page. |

### 2.2 Product Inventory
| ID | Test Case | Expected Result |
|---|---|---|
| SELL_08 | List a new product with valid details | Product is added to the inventory list. |
| SELL_09 | Upload more than 5 images for a product | Error: "Maximum 5 images allowed." |
| SELL_10 | Upload product image > 300KB | Error: "Image [name] exceeds 300KB limit." |
| SELL_11 | List product with "Hide Price" checked | Product shows "DM for Price" instead of the numeric value on the storefront. |
| SELL_12 | Reach 7-product limit on Starter Plan | Error/Alert: "Starter plan limit reached (7 products)." |
| SELL_13 | Edit an existing product | Changes are saved and reflected in the inventory list. |
| SELL_14 | Delete a product | Product is permanently removed from the store and database. |

---

## 3. Buyer Module

### 3.1 Browsing & Discovery
| ID | Test Case | Expected Result |
|---|---|---|
| BUY_01 | Load home page | Hero slider, categories, and top products load correctly. |
| BUY_02 | Search for a product by name | Results matching the search query are displayed. |
| BUY_03 | Filter products by Category/Subcategory | List updates to show only products in the selected categories. |
| BUY_04 | Multi-select Location filter | Products from multiple selected cities are displayed. |
| BUY_05 | Sort products by Price (Low to High / High to Low) | Product list order updates correctly. |

### 3.2 Product Details & Reviews
| ID | Test Case | Expected Result |
|---|---|---|
| BUY_06 | View product details | Description, price, images, and seller contact info load correctly. |
| BUY_07 | Click "Chat on WhatsApp" button | User is redirected to WhatsApp with a pre-filled message about the product. |
| BUY_08 | Submit a product review and rating | Review appears in the review section; average rating is updated. |

---

## 4. Admin Module

### 4.1 Dashboard & Traffic
| ID | Test Case | Expected Result |
|---|---|---|
| ADM_01 | View Dashboard Statistics | Total users, stores, and products are displayed correctly. |
| ADM_02 | Monitor Recent Traffic | List shows recent product views and WhatsApp clicks with timestamps. |
| ADM_03 | Check System Health | Server memory usage and status are displayed. |

### 4.2 User Management
| ID | Test Case | Expected Result |
|---|---|---|
| ADM_04 | Create a new user from Admin panel | User is created with the default password ("password123"). |
| ADM_05 | Create user with invalid username format | Error: "Username can only contain letters, numbers, and underscores (_)." |
| ADM_06 | Edit user role (Buyer to Seller) | User's role is updated in the database. |
| ADM_07 | Reset a user's password | Admin can set a new password for any user. |
| ADM_08 | Delete a user | User and all their associated data (stores/products if seller) are deleted. |
