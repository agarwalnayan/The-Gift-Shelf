# Testing Sprint 2: Product Management & Customization Engine

## 1. Install dependencies

No new packages were introduced this sprint (`joi` and `react-hook-form` were already added during the Category Management sprint). If you haven't run installs since then:

```bash
cd backend && npm install
cd ../admin && npm install
cd ../customer && npm install
```

No new environment variables are required.

## 2. Start the stack

```bash
cd backend && npm run dev     # http://localhost:5000
cd admin && npm run dev       # http://localhost:5174
cd customer && npm run dev    # http://localhost:5173
```

## 3. Regression check: existing products still show up

If you already had products in the database before this sprint, open the customer storefront (`/products`, `/`) and confirm they still appear. This works because `publishStatus` defaults to `'published'` for any document that doesn't already have the field — no migration script needed.

## 4. Create a product with the full field set

1. In the admin panel, go to **Products → Add Product**.
2. **Basic Info tab**: fill name, short/long description, Base Price, Sale Price, Cost Price, stock, low stock alert. Set Publish Status to "Draft" and toggle Active on.
3. **Organization tab**: pick a category (and optionally a subcategory), brand, tags/occasion/recipient (comma separated), material, weight, dimensions.
4. **Images tab**: select 2–3 images; drag to reorder; the first one shown is used as primary.
5. **Variants tab**: add a variant, add attributes like `Color: Red`, `Size: M`, set a price override and stock. Add a second variant with different attributes.
6. **Customization tab**: add a "Gift Message" option (type: Gift Message, required: no, max length: 200), and a "Greeting Card" option (type: Greeting Card, choices: `Floral, Minimal, Funny`, additional price: 50).
7. **SEO tab**: fill meta title/description/keywords.
8. Submit — confirm a success toast and redirect to the product list.

## 5. Publish/Draft and Active/Inactive are independent

1. In the product list, toggle **Published** on for your new product without touching **Active** — confirm both toggle independently and persist after refresh.
2. Set Published back off (Draft) and confirm the product disappears from the customer storefront's product listing, while still being visible/editable in the admin panel.

## 6. Edit: image management

1. Open the product for editing → Images tab.
2. Drag an image to reorder, click the star icon on a different image to make it primary, delete one image, add a new one.
3. Click **Save Image Changes** — confirm the toast, and that the product list thumbnail reflects the new primary image.

## 7. Variants scalability

1. Edit the product, go to Variants, add a third variant with an attribute name you invent, e.g. `Package Type: Gift Box` — confirm it saves with no backend changes needed.
2. Confirm each variant's SKU was auto-generated (visible after reload) if you left the SKU field blank.

## 8. Bulk actions

1. On the product list, select 2+ products via the row checkboxes.
2. Try each bulk action (Activate, Deactivate, Publish, Move to Draft, Feature, Unfeature, Move to Trash) and confirm the toast and the table update after each.

## 9. Soft delete / restore / permanent delete

1. Delete a single product (trash icon) — confirm the dialog, then confirm it disappears from the default list.
2. Toggle "Show Deleted" in the filter bar — the product reappears dimmed with a restore icon.
3. Restore it — confirms it's back to normal.
4. As a **superadmin**, delete it again, then permanently delete it from the "Show Deleted" view — confirm it's gone and its Cloudinary images were removed. As a plain `admin`, confirm the permanent-delete call is rejected with `403` if attempted directly against the API.

## 10. Customization Engine end-to-end (API-level, since the customer-facing picker UI is scoped for a future sprint)

```bash
# 1. Add to cart with customizations
curl -X POST -H "Authorization: Bearer <customer_token>" -H "Content-Type: application/json" \
  -d '{
    "productId": "<product_id>",
    "quantity": 1,
    "customizations": [
      { "key": "gift_message", "value": "Happy Birthday!" },
      { "key": "greeting_card", "value": "Floral" }
    ]
  }' \
  http://localhost:5000/api/v1/cart

# Confirm the response cart item includes normalized customizations and a
# customizationPrice of 50 (from the Greeting Card option's additional price).

# 2. Try omitting a required option (if you marked one required) — expect a 400
#    with a message like `"Gift Message" is required`.

# 3. Try a greeting card value not in the configured choices — expect a 400
#    "Invalid selection provided for..."

# 4. Add the SAME product again with DIFFERENT customizations — confirm the
#    cart now has two separate line items (GET /cart), not merged quantities.

# 5. Update/remove a specific line by its item id (not product id):
curl -X PATCH -H "Authorization: Bearer <customer_token>" -H "Content-Type: application/json" \
  -d '{"itemId":"<cart_item_id>","quantity":2}' \
  http://localhost:5000/api/v1/cart
```

## 11. Place an order and check the Admin Order Detail page

1. From the customer app, add a customized product to the cart (via the API calls above, since a dynamic picker UI isn't built yet) and complete checkout (COD is simplest for testing — Razorpay test mode also works with test card numbers).
2. In the admin panel, go to **Orders**, click the order id.
3. Confirm the new **Admin Order Detail** page (`/orders/:id`) shows each line item's personalization (Gift Message text, Greeting Card choice, plus the `+₹50` surcharge), shipping address, and price breakdown.

## 12. Variant stock deduction

1. Note a variant's stock count before ordering.
2. Add that variant to the cart (`variantSku` in the payload) and complete an order.
3. Confirm only that variant's stock decremented (check via `GET /products/:id` as admin), not the product's base `stock`.

## What's intentionally out of scope this sprint

The **customer-facing** dynamic customization form (rendering the configured options as an interactive picker on the product detail page, with live price updates) is a storefront UI feature and is recommended as the next sprint. Everything it needs — the schema, validation, pricing, cart/order storage, and admin visibility — is fully built and tested above.
