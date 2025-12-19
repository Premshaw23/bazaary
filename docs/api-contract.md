# 📘 Bazaary API Contract (Backend → Frontend)

**Version:** v1  
**Status:** Frozen (Backend Complete till Week-4)  
**Auth:** JWT (Bearer Token)

**Base URL:**

    http://localhost:3001/api

---

## 🔐 Authentication

### Register
**POST** `/auth/register`

**Body**
```json
{
  "email": "user@test.com",
  "password": "password123",
  "role": "BUYER | SELLER | ADMIN"
}
```

**Response**
```json
{
  "access_token": "<jwt>",
  "user": { "id": "...", "email": "...", "role": "BUYER" }
}
```

### Login
**POST** `/auth/login`

### Current User
**GET** `/auth/me`
Authorization: Bearer <token>

---

## 👤 Users

### Get Profile
**GET** `/users/me`

### Update Profile
**PATCH** `/users/me`

---

## 🏪 Sellers

### Apply as Seller
**POST** `/sellers/apply`

Auth: SELLER

### Seller Profile
**GET** `/sellers/me`

---

## 📦 Products

### Create Product
**POST** `/products`

Auth: SELLER

```json
{
  "sku": "SKU123",
  "name": "Product name",
  "description": "Details"
}
```

### Seller Products
**GET** `/products/my`

### Public Products
**GET** `/products`

### Product by ID
**GET** `/products/:id`

---

## 🛒 Listings

### Create Listing
**POST** `/listings`

```json
{
  "productId": "<uuid>",
  "price": 1000,
  "stockQuantity": 10
}
```

### Update Listing
**PATCH** `/listings/:id`

### Listing by ID
**GET** `/listings/:id`

### Marketplace Listings
**GET** `/listings`

---

## 📊 Inventory

### Adjust Inventory
**POST** `/inventory/adjust`

Internal / Seller only

### Check Stock
**GET** `/inventory/:listingId`

---

## 🧾 Orders

### Create Order
**POST** `/orders`

Auth: BUYER

```json
{
  "items": [
    { "listingId": "<uuid>", "quantity": 2 }
  ],
  "shippingAddress": {
    "name": "Buyer",
    "phone": "+91-9999999999",
    "street": "Test",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "country": "India"
  }
}
```

### Buyer Orders
**GET** `/orders?buyerId=me`

### Seller Orders
**GET** `/orders?sellerId=me`

### Order Details
**GET** `/orders/:id`

### Order Items
**GET** `/orders/:id/items`

### Update Order State
**PATCH** `/orders/:id/state`

```json
{
  "state": "CONFIRMED | SHIPPED | DELIVERED | CANCELLED"
}
```

### Cancel Order
**POST** `/orders/:id/cancel`

---

## 💳 Payments

### Initiate Payment
**POST** `/payments/initiate`
Headers:
Idempotency-Key: <unique-string>

```json
{
  "orderId": "<uuid>",
  "method": "CARD | UPI"
}
```

### Verify Payment
**POST** `/payments/verify`

```json
{
  "paymentId": "<uuid>",
  "transactionId": "<gateway-id>"
}
```

### Payment by ID
**GET** `/payments/:id`

### Payments by Order
**GET** `/payments/order/:orderId`

### Refund
**POST** `/payments/refund`

```json
{
  "paymentId": "<uuid>",
  "amount": 500,
  "reason": "Product damaged"
}
```

---

## 💰 Wallets (Seller)

### Wallet Summary
**GET** `/wallets/summary`

**Response**
```json
{
  "locked": 1121,
  "available": 0
}
```

### Wallet Ledger
**GET** `/wallets/ledger`

### Request Payout
**POST** `/wallets/payout`

```json
{
  "amount": 1000
}
```

---

## 🛠 Wallets (Admin)

### Approve Payout
**POST** `/wallets/admin/payout/approve`

### Platform Ledger
**GET** `/wallets/admin/platform-ledger`

---

## 📡 Events (Internal / Admin Only)

⚠️ Not for frontend consumption

**POST** `/events/replay`
**GET**  `/events`

---

## 🎯 Frontend Usage Guide

**Buyer App**
- auth
- products
- listings
- orders
- payments

**Seller Dashboard**
- products
- listings
- orders
- wallets

**Admin Panel**
- sellers
- wallets/admin
- orders
