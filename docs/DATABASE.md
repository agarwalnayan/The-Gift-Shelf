# Database Documentation

The application relies on MongoDB with Mongoose ODM. Below are the current collections in use.

## 1. User
**Purpose**: Stores all users including customers, admins, and superadmins.
- **Relationships**: Can have multiple addresses; references `Product` for wishlist items.
- **Important Fields**:
  - `role`: Enum (`customer`, `admin`, `superadmin`).
  - `email`: Unique identifier.
  - `password`: Hashed securely via bcrypt.
  - `addresses`: Array of subdocuments containing address details.
- **Indexes**: Unique index on `email`.
- **Business Logic**: Pre-save hook hashes password; methods for comparing passwords and sanitizing output object.

## 2. Category
**Purpose**: Represents a hierarchical category structure for products.
- **Relationships**: `parentCategory` references another `Category` (self-referencing).
- **Important Fields**:
  - `slug`: Auto-generated unique URL-friendly string.
  - `level`: Number indicating depth in the tree.
  - `isDeleted`: Soft-delete flag.
- **Indexes**: `parentCategory`, `isDeleted`, `isActive`, Text index on `name` and `description`.
- **Business Logic**: Pre-save hook generates unique slugs; static method prevents circular references in category trees.

## 3. Product
**Purpose**: Core catalog items with support for variants and customizations.
- **Relationships**: References `Category` (category & subCategory), `User` (createdBy, updatedBy).
- **Important Fields**:
  - `variants`: Array of variant schemas with their own sku, stock, price, and dynamic attributes.
  - `customizationOptions`: Loose configuration options that allow frontend to render dynamic inputs.
  - `stockStatus`: Virtual field computing stock state.
  - `isDeleted`: Soft-delete flag.
- **Indexes**: Unique `slug`, `sku`, Text index on names/tags, Sparse unique on `variants.sku`.
- **Business Logic**: Pre-save slug generation; virtuals for `finalPrice` and `primaryImage`.

## 4. Cart
**Purpose**: Stores a user's current shopping cart session.
- **Relationships**: References `User` (1-to-1) and `Product` (in cart items array).
- **Important Fields**:
  - `items`: Array of items containing `quantity`, `priceAtAddition`, and selected `customizations`.
- **Indexes**: Unique index on `user`.
- **Business Logic**: Customizations and prices are snapshotted at the time of addition so admin price changes don't retroactively alter the cart contents unexpectedly.

## 5. Order
**Purpose**: Immutable record of a finalized customer purchase.
- **Relationships**: References `User` and `Product`.
- **Important Fields**:
  - `orderItems`: Snapshot of products purchased.
  - `shippingAddress`: Fixed snapshot of the delivery address.
  - `paymentMethod`: `razorpay` or `cod`.
  - `paymentResult`: Razorpay metadata (orderId, paymentId, signature).
  - `orderStatus`: pending, processing, shipped, delivered, cancelled.
- **Indexes**: (Default Mongoose `_id`).
- **Business Logic**: Acts as an immutable receipt; ties directly into the Razorpay payment verification flow.

## 6. Review
**Purpose**: Customer ratings and reviews for products.
- **Relationships**: References `Product` and `User`.
- *(Implementation details standard based on model existence).*

## Future Expansion Notes
> Planned
- Implementing indices for advanced analytics and sorting if dataset grows significantly.
- Migrating cart sessions to a Redis store if horizontal scaling becomes a bottleneck.
