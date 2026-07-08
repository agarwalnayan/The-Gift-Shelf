# Architecture

## Folder Structure
The project operates as a monorepo containing three distinct applications:
- `/backend`: Node.js/Express API.
- `/customer`: Vite/React app for shoppers.
- `/admin`: Vite/React app for administrators.

## Backend Architecture
- **Framework**: Express.js
- **Pattern**: MVC-like (Models, Controllers, Routes, Middlewares, Validations).
- **Validation**: Joi is used at the route level to sanitize and validate requests before they hit the controllers.
- **Data Layer**: Mongoose handles MongoDB interactions, including pre-save hooks (e.g., slug generation, password hashing).

## Customer App
- Single Page Application built with React and Vite.
- Styled with Tailwind CSS.
- Communicates exclusively with the backend via REST APIs.

## Admin App
- Single Page Application built with React and Vite.
- Styled with Tailwind CSS.
- Handles CMS functionalities (Products, Categories, Orders, Users).

## Authentication Flow
- Stateless authentication using JSON Web Tokens (JWT).
- The `/auth/login` endpoint returns a token.
- Protected routes use the `protect` middleware to verify the token.
- Role-based access is managed via the `authorizeRoles('admin', 'superadmin')` middleware.

## Request Flow
1. **Client** makes an HTTP request.
2. **Express Router** matches the route.
3. **Middlewares** execute (Auth, Role check, File upload via Multer, Validation via Joi).
4. **Controller** processes the business logic.
5. **Mongoose Model** queries or mutates the database.
6. **Controller** returns a formatted JSON response.

## Cloudinary Integration
- Used for image storage (Products, Categories, Avatars).
- Handled via Multer middleware, passing files to the Cloudinary API.

## Razorpay Integration
- Integrated in the Order flow.
- The server generates a Razorpay Order ID.
- The client completes payment and sends a signature back.
- The server verifies the signature securely in the `/verify-payment` route.

## MongoDB Architecture
- Uses a NoSQL approach but heavily utilizes referential integrity (Mongoose `populate`).
- Complex nested structures are utilized for product customization options rather than strict relational tables, maximizing flexibility.

## RBAC (Role-Based Access Control)
- Users are assigned roles: `customer`, `admin`, `superadmin`.
- Superadmins have exclusive destructive rights (e.g., permanent deletion).

## API Structure
- RESTful principles are strictly followed.
- Sub-routers split logic into modular domains (`/users`, `/products`, `/orders`, `/cart`, etc.).
