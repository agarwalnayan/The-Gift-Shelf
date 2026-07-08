# API Reference

All endpoints are assumed to be prefixed with `/api` or the equivalent base router path.

## Authentication (`/auth`)
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Authenticate user and issue JWT |
| POST | `/logout` | Public | Logout and clear token (if using cookies) |
| GET | `/me` | User | Retrieve current authenticated user profile |

## Users (`/users`)
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| PATCH | `/profile` | User | Update personal information |
| POST | `/addresses` | User | Add a new shipping address |
| DELETE | `/addresses/:addressId` | User | Remove an address |
| PATCH | `/wishlist/:productId` | User | Toggle product in wishlist |
| GET | `/` | Admin | List all users |
| PATCH | `/:id/status` | Admin | Activate/Deactivate user |

## Categories (`/categories`)
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/tree` | Public | Fetch category hierarchy tree |
| GET | `/` | Public | List all active categories |
| GET | `/:idOrSlug` | Public | Get single category details |
| POST | `/` | Admin | Create new category (supports images) |
| PATCH | `/reorder` | Admin | Reorder categories in the tree |
| PATCH | `/:id/status` | Admin | Update active status |
| PATCH | `/:id/feature` | Admin | Toggle feature status |
| PATCH | `/:id/restore` | Admin | Restore a soft-deleted category |
| PUT/PATCH | `/:id` | Admin | Update category details (supports images) |
| DELETE | `/:id` | Admin | Soft-delete category |
| DELETE | `/:id/permanent` | Superadmin | Permanently delete category |

## Products (`/products`)
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Public | List products (with filtering/pagination) |
| GET | `/:idOrSlug` | Public | Get single product details |
| POST | `/:id/customization-image` | User | Upload customer-provided customization image |
| POST | `/` | Admin | Create a new product (supports images) |
| PATCH | `/bulk` | Admin | Perform bulk actions on multiple products |
| PATCH | `/:id/images` | Admin | Update product images |
| PATCH | `/:id/status` | Admin | Update active status |
| PATCH | `/:id/publish` | Admin | Update publish status |
| PATCH | `/:id/feature` | Admin | Toggle featured status |
| PATCH | `/:id/restore` | Admin | Restore a soft-deleted product |
| PUT/PATCH | `/:id` | Admin | Update product details |
| DELETE | `/:id` | Admin | Soft-delete product |
| DELETE | `/:id/permanent` | Superadmin | Permanently delete product |

## Cart (`/cart`)
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/` | User | Retrieve current user's cart |
| POST | `/` | User | Add an item (product/variant/customization) to cart |
| PATCH | `/` | User | Update item quantity or customizations |
| DELETE | `/:itemId` | User | Remove item from cart |
| DELETE | `/` | User | Clear entire cart |

## Orders (`/orders`)
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/` | User | Create a new order (initiates Razorpay) |
| POST | `/verify-payment` | User | Verify Razorpay payment signature |
| GET | `/my-orders` | User | Retrieve current user's order history |
| GET | `/:id` | User/Admin | Retrieve specific order details |
| GET | `/` | Admin | List all orders across platform |
| PATCH | `/:id/status` | Admin | Update order status (processing, shipped, etc.) |

---

*Note: Data validation is enforced using `Joi` in the route layer (`validateMiddleware`). Roles are enforced using `authorizeRoles`.*
