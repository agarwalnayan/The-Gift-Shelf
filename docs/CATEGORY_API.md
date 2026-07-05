# Category Management API

Base URL: `/api/v1/categories`

All admin-only endpoints require a valid session (JWT cookie or `Authorization: Bearer <token>`) belonging to a user with role `admin` or `superadmin`.

Public (read) endpoints accept an optional token: when a valid admin/superadmin token is present, extra data (inactive/soft-deleted records, unfiltered fields) is returned; anonymous or non-admin requests always see only active, non-deleted categories.

---

## 1. GET /categories

List categories. Public, with expanded results for authenticated admins.

**Query Parameters** (all optional):

| Param | Type | Description |
|---|---|---|
| `search` | string | Full-text search across name, description, shortDescription |
| `isActive` | `'true' \| 'false'` | Filter by active status (admin only) |
| `isFeatured` | `'true' \| 'false'` | Filter featured categories (admin only) |
| `showOnHomepage` | `'true' \| 'false'` | Filter homepage-visible categories (admin only) |
| `parentCategory` | ObjectId or `'null'` | Filter by parent (`null` = top-level only) |
| `level` | number | Filter by nesting depth |
| `includeDeleted` | `'true'` | Include soft-deleted categories (admin only) |
| `page`, `limit` | number | Pagination (admin only — if omitted, returns the full matching list for backward compatibility with the storefront) |
| `sort` | `displayOrder \| newest \| oldest \| nameAsc \| nameDesc` | Sort order (default `displayOrder`) |

**Response (no pagination params):**
```json
{ "success": true, "message": "...", "data": { "categories": [...], "count": 12 } }
```

**Response (with `page`/`limit`):**
```json
{ "success": true, "message": "...", "data": { "categories": [...], "total": 42, "page": 1, "totalPages": 4 } }
```

---

## 2. GET /categories/tree

Returns the full category hierarchy as a nested tree (built from a single flat query, not recursive DB calls). Public, with the same active/deleted visibility rules as above.

```json
{ "data": { "tree": [ { "_id": "...", "name": "Gifts", "children": [ { "_id": "...", "name": "For Him", "children": [] } ] } ] } }
```

---

## 3. GET /categories/:idOrSlug

Fetch a single category by Mongo ObjectId **or** by slug — the server detects which one was passed. Public, with admin-only visibility into inactive/deleted categories.

Populates `parentCategory`, `createdBy`, `updatedBy`.

---

## 4. POST /categories — Admin/Superadmin only

Creates a category. `multipart/form-data`.

| Field | Type | Notes |
|---|---|---|
| `name` | string | required, 2–150 chars |
| `description` | string | optional, ≤2000 chars |
| `shortDescription` | string | optional, ≤300 chars |
| `parentCategory` | ObjectId | optional |
| `displayOrder` | number | optional, default 0 |
| `isActive` | boolean | optional, default true |
| `isFeatured` | boolean | optional, default false |
| `showOnHomepage` | boolean | optional, default false |
| `seo` | JSON string | `{ "metaTitle": "", "metaDescription": "", "keywords": [] }` |
| `image` | file | optional, category image |
| `banner` | file | optional, banner image |

`slug` and `level` are computed server-side and cannot be set directly.

---

## 5. PUT /categories/:id or PATCH /categories/:id — Admin/Superadmin only

Partial update, same field set as create (all optional). Same validation rules. Both verbs are supported and mapped to the same handler.

Rejects if the chosen `parentCategory` would create a circular reference (a category cannot become its own ancestor).

---

## 6. PATCH /categories/:id/status — Admin/Superadmin only

Body: `{ "isActive": true | false }`

---

## 7. PATCH /categories/:id/feature — Admin/Superadmin only

Body (at least one required): `{ "isFeatured"?: boolean, "showOnHomepage"?: boolean }`

---

## 8. PATCH /categories/reorder — Admin/Superadmin only

Bulk-updates `displayOrder` in a single request.

Body:
```json
{ "items": [ { "id": "664f...", "displayOrder": 0 }, { "id": "664e...", "displayOrder": 1 } ] }
```

---

## 9. DELETE /categories/:id — Admin/Superadmin only (Soft Delete)

Moves the category to trash (`isDeleted: true`, `isActive: false`, `deletedAt` set). Blocked with `400` if the category still has active (non-deleted) subcategories.

## 10. PATCH /categories/:id/restore — Admin/Superadmin only

Restores a soft-deleted category. If its former parent no longer exists or was itself deleted, it's restored as a top-level category.

## 11. DELETE /categories/:id/permanent — Superadmin only

Hard-deletes the category document and removes its Cloudinary images. Blocked with `400` if subcategories still reference it.

---

## Error Format

All errors use the existing `ApiError`/`errorHandler` shape:
```json
{ "success": false, "message": "Category not found", "errors": [] }
```
Validation failures (Joi) populate `errors` with one message per invalid field:
```json
{ "success": false, "message": "Validation failed", "errors": ["Category name is required"] }
```

## Notes on Security

- All mutating routes are behind `protect` + `authorizeRoles('admin', 'superadmin')` (permanent delete additionally requires `superadmin`).
- Every request body is validated with Joi before it reaches a controller.
- `parentCategory` is validated as a real, non-deleted category id, and checked against circular-reference creation before being persisted.
- Slugs are generated server-side from `name` and de-duplicated automatically (`gift-hampers`, `gift-hampers-1`, …) — never accepted directly from the client.
