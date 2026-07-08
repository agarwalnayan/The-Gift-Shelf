# Business Rules

This document outlines the core business and software rules that dictate the behavior of The Gift Shelf (TGS) system.

## 1. Website-First Philosophy
- All core functionalities and personalization capabilities must be accessible via the web applications (Customer/Admin SPA). 

## 2. Admin-Driven Configuration
- **No Hardcoded Categories**: All product categories and hierarchies are managed dynamically in the database and curated via the admin dashboard.
- **Dynamic Customizations**: Customization options for products are defined in the database (e.g., text, image uploads, dropdown choices) allowing the platform to support new customization concepts without requiring code deployments.

## 3. Product Integrity & Historical Accuracy
- **Snapshotting**: When a user adds an item to their cart or places an order, the exact price and customization choices are snapshotted in the `Cart` and `Order` documents. This ensures that retroactive changes by an Admin do not alter pending checkouts or historical receipts.
- **Soft Deletion Pattern**: Products and Categories are soft-deleted by setting an `isDeleted` flag. This prevents breaking relationships with past orders or analytics. Only a `superadmin` can perform hard (permanent) deletes.

## 4. Trust-First Design & Premium Branding
- All product images are centralized in Cloudinary to maintain performance and reliable delivery. 
- Validation logic at the route level ensures that bad data never touches the database, maintaining platform integrity.
- Passwords and sensitive data are strictly hashed.

## 5. Asset-Light Business Model
- Inventory and stock levels are tracked rigidly in the `Product` schema (`stock`, `lowStockThreshold`) enabling Just-In-Time operations if required. 

## 6. Scalability Principles
- Stateless Authentication via JWT allows horizontal scaling of the backend.
- Decoupling of Frontend and Backend ensures independent scaling and deployment pipelines for the SPAs and the API.
- Use of indexing on text fields (name, tags, description) in MongoDB to optimize search performance.

---
> Planned
- Rate Limiting integration on key endpoints.
- Integration with external ERP/Logistics providers based on the `orderStatus` pipeline.
