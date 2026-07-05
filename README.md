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

Health check: `GET http://localhost:5001/health`
API base: `http://localhost:5001/api/v1`

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
