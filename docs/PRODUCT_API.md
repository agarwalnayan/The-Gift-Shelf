# Product Management & Customization Engine API

Base URL: `/api/v1/products`

Admin-only endpoints require a valid session (JWT cookie or `Authorization: Bearer <token>`) with role `admin` or `superadmin`. Public endpoints accept an optional token the same way the Category module does: an authenticated admin sees inactive/draft/soft-deleted products; anyone else only sees active, published, non-deleted products.

---

## Pricing field mapping (important)

The spec calls for **Base Price / Sale Price / Cost Price**. To avoid breaking the cart, checkout, and order pipeline that already depend on the original `price` / `discountPrice` fields:

| Spec term | Actual field | Notes |
|---|---|---|
| Base Price | `price` | unchanged, required |
| Sale Price | `discountPrice` | unchanged field, just relabeled "Sale Price" in the admin UI |
| Cost Price | `costPrice` | **new**, admin-only, never sent to the storefront's pricing logic |

`product.finalPrice` (existing virtual) still resolves to `discountPrice` when set, else `price` — no change in behavior for the storefront.

---

## 1. GET /products

List products. Public, with expanded results for authenticated admins.

New query params added on top of the existing ones (`category`, `search`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`, `featured`):

| Param | Type | Description |
|---|---|---|
| `subCategory` | ObjectId | Filter by subcategory |
| `brand` | string | Exact brand match |
| `occasion` | string | Matches if present in the product's `occasion` array |
| `recipient` | string | Matches if present in the product's `recipient` array |
| `tags` | string | Matches if present in the product's `tags` array |
| `isActive`, `isFeatured`, `publishStatus` | — | Admin-only filters |
| `includeDeleted` | `'true'` | Admin-only, include soft-deleted products |

Response shape is unchanged: `{ products, total, page, totalPages }`.

## 2. GET /products/:idOrSlug

Fetch by Mongo id **or** slug (auto-detected), same pattern as Category. Public visibility rules apply unless the requester is an authenticated admin.

## 3. POST /products — Admin/Superadmin, `multipart/form-data`

Existing fields (`name`, `description`, `shortDescription`, `category`, `price`, `discountPrice`, `stock`, `tags`, `attributes`, `images`) are unchanged. New fields:

| Field | Type | Notes |
|---|---|---|
| `brand` | string | optional |
| `subCategory` | ObjectId | optional |
| `costPrice` | number | optional |
| `lowStockThreshold` | number | optional, default 5 |
| `material` | string | optional |
| `occasion`, `recipient` | JSON string array | optional |
| `weight` | JSON string `{ value, unit }` | optional |
| `dimensions` | JSON string `{ length, width, height, unit }` | optional |
| `publishStatus` | `'draft' \| 'published'` | optional, default `published` at the schema level (see migration note below) |
| `seo` | JSON string `{ metaTitle, metaDescription, keywords }` | optional |
| `variants` | JSON string array, see below | optional |
| `customizationOptions` | JSON string array, see below | optional, this is the Customization Engine config |
| `images` | files (up to 8) | first upload becomes primary automatically |

**Migration note:** `publishStatus` defaults to `'published'` (not `'draft'`) at the schema level specifically so every product created before this sprint remains visible on the storefront without a manual migration. New products created through the admin form default to `'draft'` at the UI level — the admin explicitly chooses when to publish.

### Variant object shape
```json
{ "sku": "optional, auto-generated if omitted", "attributes": [{ "name": "Color", "value": "Red" }], "price": 599, "stock": 10, "isActive": true }
```
`attributes` is a free-form name/value list — new variant dimensions (e.g. "Engraving Style") need zero schema changes, just start sending a new `name`.

### Customization option object shape (the Customization Engine)
```json
{
  "key": "gift_message",
  "label": "Gift Message",
  "type": "gift_message",
  "isEnabled": true,
  "isRequired": false,
  "additionalPrice": 0,
  "choices": [],
  "placeholder": "Write your message…",
  "helpText": "Max 200 characters",
  "displayOrder": 0,
  "validation": { "maxLength": 200 }
}
```
Supported `type` values live in `backend/src/utils/customizationTypes.js`: `image_upload`, `multi_image_upload`, `text_input`, `multi_text_input`, `date_input`, `dropdown`, `font_selection`, `text_color`, `gift_message`, `greeting_card`, `gift_wrapping`, `special_instructions`. **Adding a new type is a one-file change** (add it to that array, optionally teach `validateCustomizations.js` a new branch) — no database migration, since `type` is stored as a plain string, not a Mongoose enum.

`validation` is a flexible bag of optional rules: `minLength`/`maxLength` (character limits), `minSelections`/`maxSelections` (multi-input/multi-image counts), `allowedFileTypes`/`maxFileSizeMB` (uploads), `minDate`/`maxDate` (date input), `pattern`.

`key` must be unique within a product; the admin UI auto-derives it from the label.

## 4. PUT /products/:id or PATCH /products/:id — Admin/Superadmin

Same field set as create, all optional, `multipart/form-data`. Any `images` files sent here are **appended** to the existing gallery (see the dedicated images endpoint below for reordering/removal/primary).

## 5. PATCH /products/:id/images — Admin/Superadmin

Manages the gallery in one call. `multipart/form-data`:
- `imagesMeta`: JSON string — the desired final list of *existing* images to keep: `[{ "publicId": "...", "order": 0, "isPrimary": true }, ...]`. Any current image whose `publicId` is omitted is deleted from Cloudinary.
- `images`: new files to append (optional).

## 6. PATCH /products/:id/status — `{ "isActive": true|false }`
## 7. PATCH /products/:id/publish — `{ "publishStatus": "draft"|"published" }`
## 8. PATCH /products/:id/feature — `{ "isFeatured": true|false }`

## 9. PATCH /products/bulk — Admin/Superadmin

```json
{ "ids": ["<id1>", "<id2>"], "action": "activate|deactivate|publish|draft|feature|unfeature|delete" }
```
`delete` performs a soft delete on every id in the list.

## 10. DELETE /products/:id — Soft delete (Admin/Superadmin)
## 11. PATCH /products/:id/restore — Restore a soft-deleted product (Admin/Superadmin)
## 12. DELETE /products/:id/permanent — Hard delete + Cloudinary cleanup (**Superadmin only**)

## 13. POST /products/:id/customization-image — any logged-in customer

Uploads an image for an `image_upload` / `multi_image_upload` customization option ahead of adding the product to the cart. `multipart/form-data`, field `file`. Returns `{ url, publicId }` to include in the cart payload.

---

# Cart & Order changes (to carry customization data end-to-end)

## POST /cart (add to cart)

```json
{
  "productId": "...",
  "quantity": 2,
  "variantSku": "TGS-MUG-ABC1-RED-M",
  "customizations": [
    { "key": "gift_message", "value": "Happy Birthday!" },
    { "key": "greeting_card", "value": "Floral" }
  ]
}
```
The server re-validates every selection against the product's live `customizationOptions` (required fields present, length/selection limits, valid choices, valid dates, valid image URLs) via `validateCustomizations.js`, and computes `additionalPrice` itself — the client cannot inflate or bypass pricing. A product added twice with different customizations produces two distinct cart lines rather than merging quantities.

**Breaking change from the previous cart API:** because the same product can now appear as several distinct personalized lines, cart lines are addressed by their own `itemId`, not by `productId`:
- `PATCH /cart` body is now `{ "itemId": "...", "quantity": 2 }` (was `{ productId, quantity }`)
- `DELETE /cart/:itemId` (was `DELETE /cart/:productId`)

The customer app (`CartContext`, `CartItem`, `cartApi.js`) has been updated accordingly. `addItem(productId, quantity)` from existing call sites (e.g. the product detail page) still works unchanged — variant/customizations are an optional third argument.

## Order line items now include

```json
{
  "product": "...",
  "name": "...",
  "image": "...",
  "variantSku": "TGS-MUG-ABC1-RED-M",
  "quantity": 2,
  "price": 599,
  "customizations": [{ "key": "gift_message", "label": "Gift Message", "type": "gift_message", "value": "Happy Birthday!", "additionalPrice": 0 }],
  "customizationPrice": 50
}
```
`itemsPrice` on the order now includes `(price + customizationPrice) * quantity` per line, so personalization surcharges are reflected in the total the customer pays. Stock is decremented from the matching **variant's** stock when `variantSku` is present, otherwise from the product's base stock.

Admin order details (`GET /orders/:id`, rendered at `/orders/:id` in the admin panel) display each line's customizations, including uploaded images, inline.
