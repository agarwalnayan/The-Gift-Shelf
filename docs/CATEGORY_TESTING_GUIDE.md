# Testing the Category Management Module

## 1. Install new dependencies

```bash
cd backend && npm install    # pulls in the new "joi" dependency
cd ../admin && npm install   # pulls in the new "react-hook-form" dependency
```

No new environment variables are required — the module reuses the existing Mongo, JWT, and Cloudinary configuration.

## 2. Start the stack

```bash
cd backend && npm run dev     # http://localhost:5000
cd admin && npm run dev       # http://localhost:5174
```

## 3. Get an admin account

Register a user through the customer app or `POST /api/v1/auth/register`, then promote it in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

Log in at `http://localhost:5174/login`.

## 4. Table view — create, edit, toggle

1. Open **Categories** in the sidebar. The table loads with a skeleton first, then real data (empty state if none exist yet).
2. Click **Add Category** → fill in name, description, pick a parent (or leave "None (Top Level)"), upload a category image/banner, fill in the SEO section, submit.
   - Confirm a success toast appears and the new row shows up.
   - Try submitting with an empty name — the form should block submission with a validation message instead of hitting the API.
3. Click the edit icon on the new category, change the name, save — confirm the slug updates automatically and no duplicate-slug error occurs even if you reuse a similar name.
4. Toggle **Active** and **Featured** switches directly in the table — confirm the toast and that the state persists after a page refresh.

## 5. Nested categories & cycle protection

1. Create a second category and set the first one as its parent. Confirm it appears indented under its parent in the parent dropdown for a third new category.
2. Edit the **parent** category and try to set its own child as its parent — the API should reject this with "This parent selection would create a circular category hierarchy" and the UI should show the error toast.

## 6. Search, filter, sort, pagination

1. Type into the search box — the list should re-fetch after a short debounce.
2. Switch the status filter to "Inactive" — only inactive categories should show.
3. Switch sort to "Name: A-Z" / "Z-A" and confirm order changes.
4. Create more than 12 categories to confirm pagination controls appear and page navigation works.

## 7. Drag-and-drop reorder

1. Make sure sort is set to "Display Order" and search is empty (reorder is disabled otherwise, by design, since the visible order wouldn't match the true index).
2. Drag a row by its handle to a new position — the list should reorder immediately (optimistic update) and a success toast confirms the server accepted it. Refresh the page to confirm the order persisted.

## 8. Soft delete & restore

1. Delete a leaf category (no subcategories) — a confirmation dialog should appear first ("Move category to trash?"). Confirm it.
2. Try deleting a category that still has an active subcategory — expect a `400` error ("Cannot delete a category that has active subcategories…").
3. Toggle "Show Deleted" in the filter bar — the deleted category should reappear, dimmed, with a restore icon instead of edit.
4. Click restore — confirm it reappears as active/normal in the regular view.

## 9. Permanent delete (superadmin only)

1. Promote your test user to `role: "superadmin"` in MongoDB, or use a superadmin account.
2. With "Show Deleted" on, click the permanent-delete icon on a trashed category, confirm the dialog, and verify the record and its Cloudinary images are gone.
3. Log in as a plain `admin` (not superadmin) and confirm the permanent-delete endpoint returns `403` if called directly (the UI still exposes the icon; enforcement is server-side per the spec's role requirements — restrict the icon further in the UI if you want to hide it from non-superadmins).

## 10. Grid view

1. Toggle to grid view via the view switch next to "Add Category" — confirm the same data renders as cards with the same toggles and actions.

## 11. Storefront regression check

1. Open the customer app's `/categories` page and the category filter dropdown on `/products` — both should continue to work unchanged, showing only active categories, since the public `GET /categories` response shape was preserved for unauthenticated requests.

## 12. API-level spot checks (optional, via curl/Postman)

```bash
# Public list (active only)
curl http://localhost:5000/api/v1/categories

# Tree
curl http://localhost:5000/api/v1/categories/tree

# Admin-authenticated list including inactive + deleted, paginated
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/api/v1/categories?page=1&limit=10&includeDeleted=true"

# Reorder
curl -X PATCH -H "Authorization: Bearer <admin_token>" -H "Content-Type: application/json" \
  -d '{"items":[{"id":"<id1>","displayOrder":0},{"id":"<id2>","displayOrder":1}]}' \
  http://localhost:5000/api/v1/categories/reorder
```
