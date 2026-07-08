# The Gift Shelf (TGS)

A production-ready MERN e-commerce platform foundation, structured as three independent apps sharing one MongoDB backend.

## Structure

```
tgs/
├── backend/     Node.js + Express + MongoDB API
├── customer/    React + Vite customer storefront
└── admin/       React + Vite admin panel
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (image storage)
- Razorpay account (payments)

## Backend Setup

```bash
cd backend
cp .env.example .env   # fill in Mongo URI, JWT secret, Cloudinary & Razorpay keys
npm install
npm run dev             # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/health`
API base: `http://localhost:5000/api/v1`

## Customer App Setup

```bash
cd customer
cp .env.example .env
npm install
npm run dev             # starts on http://localhost:5173
```

## Admin App Setup

```bash
cd admin
cp .env.example .env
npm install
npm run dev             # starts on http://localhost:5174
```

To access the admin panel, promote a registered user's `role` field to `admin` or `superadmin` directly in MongoDB, since admin accounts are not self-registrable through the API.

## Backend Architecture

- `src/config` — env, MongoDB, Cloudinary, Razorpay clients
- `src/models` — Mongoose schemas (User, Product, Category, Cart, Order, Review)
- `src/controllers` — request handlers, no business logic leaks into routes
- `src/routes` — Express routers, mounted under `/api/v1`
- `src/middleware` — auth (JWT), error handling, file upload, validation
- `src/services` — Cloudinary, Razorpay, email integrations
- `src/utils` — ApiError, ApiResponse, asyncHandler, token helpers

## Authentication

JWT is issued on login/register and set as an httpOnly cookie, and also returned in the response body for clients (like the admin SPA) that prefer bearer-token storage. `protect` middleware validates the token; `authorizeRoles` restricts endpoints to `admin`/`superadmin`.

## Payments

Razorpay integration is wired end-to-end: order creation returns a Razorpay order, the client opens Razorpay Checkout, and `/orders/verify-payment` verifies the payment signature server-side before marking the order paid and decrementing stock. Replace the placeholder Razorpay keys in `.env` with real ones to go live.

## Category Management Module

A full nested-category system lives on top of the original scaffold:

- **Backend**: extended `Category` model (SEO fields, banner image, level, soft delete, audit fields), Joi-validated routes for CRUD, status/feature toggles, bulk reorder, tree retrieval, and soft delete/restore/permanent delete. See [`docs/CATEGORY_API.md`](./docs/CATEGORY_API.md) for the full endpoint reference.
- **Admin panel**: a complete Category Management page (table + grid views, search/filter/sort, pagination, drag-and-drop reordering, React Hook Form–based create/edit modal with image + banner upload and an SEO section, active/featured toggles, and soft delete/restore with confirmation dialogs).
- **New dependencies**: `joi` (backend validation) and `react-hook-form` (admin forms). Run `npm install` in both `backend/` and `admin/` after pulling these changes.
- **No new environment variables** are required.
- Step-by-step manual test plan: [`docs/CATEGORY_TESTING_GUIDE.md`](./docs/CATEGORY_TESTING_GUIDE.md).

The customer-facing storefront is intentionally unchanged — the public `GET /categories` and category-by-slug behavior is preserved so the existing customer app keeps working without modification.

## Product Management & Customization Engine (Sprint 2)

Extends the product catalog into a full management module plus a configurable personalization engine:

- **Backend**: extended `Product` model (brand, subcategory, cost/sale price, occasion/recipient/material/weight/dimensions, SEO, publish/draft status, soft delete, audit fields), a generic **variants** system (free-form attribute list so new variant dimensions never require a schema change), and a **customization engine** (`customizationOptions`) covering image upload, multi-image upload, text/multi-text input, date input, dropdown, font selection, text color, gift message, greeting card, gift wrapping, and special instructions — with per-option enable/required/additional-price/validation rules. New customization types are a one-file addition (`utils/customizationTypes.js`), never a migration.
- **Cart & Orders**: cart lines now carry a validated, server-priced `customizations` snapshot and an optional `variantSku`; the same product with different personalization creates distinct cart lines (addressed by their own item id, not product id); order totals include the personalization surcharge, and stock is decremented from the correct variant when applicable. Admin Order Details (`/orders/:id` in the admin panel) display each line's personalization inline.
- **Admin panel**: a tabbed Product form (Basic Info / Organization / Images / Variants / Customization / SEO) built with React Hook Form, a drag-and-drop image gallery manager (reorder, primary, delete, append), and a Products list with search/filter/sort/pagination, bulk actions, and Active/Published/Featured toggles alongside soft delete/restore/permanent delete.
- **No new environment variables or dependencies** — `joi` and `react-hook-form` were already added in the Category Management sprint.
- Full endpoint reference: [`docs/PRODUCT_API.md`](./docs/PRODUCT_API.md). Step-by-step test plan: [`docs/PRODUCT_TESTING_GUIDE.md`](./docs/PRODUCT_TESTING_GUIDE.md).

The customer-facing dynamic customization picker (rendering configured options as an interactive form on the product detail page) is intentionally left for a follow-up sprint — the schema, validation, pricing, and storage it needs are already fully built.
