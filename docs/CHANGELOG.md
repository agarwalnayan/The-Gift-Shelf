# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - Current State

### Initial Project Setup
- Configured monorepo structure with `/backend`, `/customer`, and `/admin`.
- Set up Node.js/Express backend with Mongoose.
- Initialized React + Vite frontend applications with Tailwind CSS.

### Authentication & Authorization
- Implemented JWT-based authentication.
- Added Role-Based Access Control (RBAC) supporting `customer`, `admin`, and `superadmin` roles.

### Category Management
- Developed hierarchical category system (Categories and Sub-categories).
- Implemented Soft Delete logic for categories.
- Added Cloudinary image upload support for category banners.

### Product Management
- Developed robust Product model supporting dynamic variants (SKU, dynamic attributes).
- Added Customization Options allowing diverse frontend rendering (text, uploads, selectors).
- Integrated Cloudinary for product image galleries.
- Configured Soft Delete and Admin-only permanent deletion flows.

### Shopping Experience
- Implemented Shopping Cart backend with snapshotting capability to freeze prices and customizations.
- Integrated Razorpay for order checkout and payment verification.
- Developed Order management APIs (Order status tracking, history).

### Current Sprint Focus
- Connecting customer and admin React frontends to the finalized APIs.
