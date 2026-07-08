# Project Context: The Gift Shelf (TGS)

## Project Overview
The Gift Shelf (TGS) is an e-commerce platform dedicated to offering premium personalized and customizable gifts. The project is divided into three main components: a customer-facing frontend, an admin dashboard frontend, and a centralized Node.js/Express backend API. 

## Business Vision & Brand Overview
TGS aims to provide a premium gifting experience with dynamic personalization. The brand focuses on trust, quality, and an asset-light business model while prioritizing a scalable "website-first" approach.

## Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Frontend (Customer & Admin)**: React via Vite
- **Styling**: Tailwind CSS
- **Third-Party Services**: Cloudinary (Image Management), Razorpay (Payment Gateway)

## Folder Structure
```
tgs/
├── admin/          # Vite + React + Tailwind frontend for Admins
├── backend/        # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validations/
├── customer/       # Vite + React + Tailwind frontend for Customers
└── docs/           # Documentation knowledge base
```

## Current Architecture
The system uses a traditional client-server architecture. The backend serves a RESTful API. Both the Customer and Admin apps act as Single Page Applications (SPAs) communicating via JSON over HTTP. The backend handles authentication via JWT, file uploads via Cloudinary, and payments via Razorpay.

## Development Philosophy & Software Principles
- **API-First**: Frontend apps are decoupled and driven entirely by the backend API.
- **Dynamic Configuration**: Minimal hardcoding. Categories, customization options, and variants are dynamic and admin-driven.
- **Soft Deletion**: Resources like products and categories are soft-deleted to maintain referential integrity.
- **Security-First**: Passwords hashed with bcrypt, JWT-based auth, route protection, and role-based access control (RBAC).

## Coding Standards
- ES Modules (`type: "module"`) used across the backend.
- Mongoose schema validations coupled with Joi request validations.
- Standardized error handling and response formatting.

## Current Database Overview
MongoDB handles the data layer with the following core collections:
- **Users**: Customers, Admins, Superadmins.
- **Categories**: Hierarchical category tree (supports sub-categories).
- **Products**: Supports complex variants, customization options, inventory tracking.
- **Carts**: Snapshots price and selected customizations.
- **Orders**: Finalized purchases, linked to Razorpay for payments.
- **Reviews**: Product reviews and ratings.

## Current API Overview
RESTful API endpoints prefixed under `/api` (or similar base path):
- `/auth`: Login, register, logout, current user.
- `/users`: Profile management, addresses, wishlist.
- `/categories`: Full CRUD, tree fetching, reordering.
- `/products`: Full CRUD, inventory, variants, images.
- `/cart`: Add, update, remove items, clear cart.
- `/orders`: Create orders, verify payments, tracking.

## Completed Modules
- Authentication & Authorization (JWT, RBAC)
- Hierarchical Category Management
- Product & Variant Management (with custom options)
- Shopping Cart
- Order Processing & Razorpay Integration
- Cloudinary Image Uploads

## Modules In Progress
- Customer Frontend Integration
- Admin Dashboard UI Integration

## Planned Modules
> Planned
- Advanced Analytics & Reporting
- Real-time Notifications
- Email / SMS integrations for Order Tracking

## Launch Roadmap
1. Finalize API logic (Completed).
2. Integrate Customer App (In Progress).
3. Integrate Admin App (In Progress).
4. Beta Testing & QA (Planned).
5. Production Launch (Planned).

## Known Limitations
- Customizations rely on complex JSON structures which require strict frontend adherence.
- Cart does not currently persist across anonymous sessions (requires login).

## Known Bugs
- None documented explicitly; monitor `TODO`s in the codebase.

## Important Business Rules
- **No hardcoded categories**: Everything must be manageable from the admin panel.
- Soft-delete must be used for products and categories to prevent breaking historical orders.
- Customization options must be snapshotted in the Cart/Order to prevent retroactive price changes.

## Things Future Developers Must Never Change
- The soft-delete logic for Products/Categories.
- The loose JSON structure for Product variants/customizations, which is designed to allow new types without schema changes.

## Current Sprint
- Finalizing Frontend-Backend API integrations.

## Next Sprint
- UI/UX Polish and End-to-End Testing.

## AI Collaboration Guidelines
- Always refer to `docs/` before making architectural decisions.
- Do not refactor core schemas without explicit permission.
- Always use the current exact routes/models provided.
