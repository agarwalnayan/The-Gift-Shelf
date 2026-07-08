# Launch Scope

This document outlines the exact scope for Version 1.0 of The Gift Shelf (TGS), as well as future initiatives. It serves to focus engineering efforts on what matters most right now.

## Launch Critical (Must be completed for V1.0)
These features represent the absolute minimum for a viable, premium customer experience and secure business operation.

* **Authentication**: Registration, Login, JWT verification for customers and admins.
* **Categories**: Dynamic hierarchical category navigation.
* **Product Management**: Admin ability to create, update, and manage inventory.
* **Product Detail**: High-quality display of product variants, images, and pricing.
* **Product Customization**: Frontend interface for user inputs (text, images) based on dynamic database rules.
* **Cart**: Snapshotting of prices and customized selections.
* **Checkout**: Seamless address selection and order summary.
* **Razorpay**: Integration for live payment processing and verification.
* **Orders**: Immutable order history generation and status tracking.
* **Customer Dashboard**: Basic profile management and order history view.
* **Mobile Responsive**: The customer website must perform flawlessly on mobile devices.
* **Deployment**: Production-ready hosting for API, Admin, and Customer frontends.

---

## Post Launch
Features slated for development immediately following a successful and stable V1.0 launch.

* **Wishlist**: UI integration for saving items for later (API exists).
* **AI Recommendations**: Personalized product suggestions based on browsing history.
* **Loyalty Program**: Reward points for repeat purchases.
* **Blogs**: Content marketing integration for SEO.
* **Corporate Portal**: Dedicated flow for bulk B2B gifting orders.
* **Advanced Analytics**: Granular admin insights on sales, conversion rates, and customization trends.
* **Gift Finder**: Interactive quiz/wizard to help customers find the perfect gift.
* **Marketing Automation**: Integration with email/SMS tools for cart abandonment and lifecycle emails.

---

## Deferred
Items intentionally postponed to avoid scope creep and unnecessary complexity during the initial launch phase.

* **Real-time Notifications**: WebSockets/Push notifications for order updates (will rely on email/SMS initially).
* **Complex Multi-Vendor PIM**: Full PIM architecture for supplier logins (currently managed internally via Admin).
