# Decision Log

This is a permanent engineering decision log for The Gift Shelf (TGS). It documents the architectural and business decisions that have shaped the current platform.

## Decisions

### Decision 001
* **Title**: Website-First Strategy
* **Reason**: To maintain full control over the premium gifting experience, analytics, and personalization without relying on third-party marketplace constraints.
* **Status**: LOCKED

### Decision 002
* **Title**: Dynamic Categories & Collections
* **Reason**: To allow the merchandising team to rapidly create, restructure, and feature categories without requiring software deployments.
* **Status**: LOCKED

### Decision 003
* **Title**: Dynamic Personalization
* **Reason**: Personalization is our core offering. The system uses a flexible JSON-based customization schema so new types of personalization (e.g., photo uploads, text engraving) can be added via the admin panel instantly.
* **Status**: LOCKED

### Decision 004
* **Title**: Product Belongs to Multiple Categories
* **Reason**: A gift can fit multiple criteria (e.g., "Gifts for Him" and "Anniversary Gifts"). The schema supports `category` and `subCategory` to facilitate this mapping.
* **Status**: LOCKED

### Decision 005
* **Title**: Asset-Light Supplier-Based Fulfillment
* **Reason**: To minimize overhead and scale rapidly, we rely on a supplier network rather than holding extensive physical inventory.
* **Status**: ACTIVE

### Decision 006
* **Title**: Cloudinary Image Storage
* **Reason**: To ensure fast, optimized delivery of high-quality premium product imagery and user-uploaded customizations globally.
* **Status**: LOCKED

### Decision 007
* **Title**: Razorpay Payments
* **Reason**: Reliable payment gateway supporting modern Indian payment methods (UPI, Cards, Netbanking) with robust webhook/signature verification.
* **Status**: LOCKED

### Decision 008
* **Title**: JWT Authentication
* **Reason**: Stateless authentication allows the backend API to scale horizontally easily and decouples session management from the server.
* **Status**: LOCKED

### Decision 009
* **Title**: Role-Based Access Control (RBAC)
* **Reason**: To cleanly separate `customer`, `admin`, and `superadmin` privileges, preventing unauthorized access to business operations.
* **Status**: LOCKED

### Decision 010
* **Title**: Soft Delete Strategy
* **Reason**: True deletion breaks referential integrity (e.g., deleting a product breaks historical orders). Products and categories are flagged as `isDeleted` instead.
* **Status**: LOCKED

### Decision 011
* **Title**: Native SEO Support
* **Reason**: Organic discovery is crucial. The `seo` schema (meta title, description, keywords) is embedded directly into Category and Product models.
* **Status**: ACTIVE
