# Deployment Documentation

## Environment Variables
The application requires specific environment variables to function correctly. Ensure these are defined in your deployment environment (or a `.env` file locally).

### Backend (`/backend/.env`)
```env
PORT=...
MONGO_URI=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### Customer Frontend (`/customer/.env`)
```env
VITE_API_URL=...
```

### Admin Frontend (`/admin/.env`)
```env
VITE_API_URL=...
```

## Backend Startup
- **Development**: `npm run dev` (Runs with nodemon)
- **Production**: `npm start` (Runs `node src/server.js`)

## Customer & Admin Startup
- **Development**: `npm run dev` (Vite dev server)
- **Build**: `npm run build` (Outputs to `dist/` directory)
- **Preview**: `npm run preview`

## External Dependencies
- **MongoDB Atlas**: Ensure the IP of your production server is whitelisted.
- **Cloudinary**: Create a preset or configure the credentials to accept uploads directly from the backend server.
- **Razorpay**: Switch from Test mode to Live mode credentials before production launch.

## Deployment Checklist
1. Provision Node.js environment for the Backend API.
2. Setup MongoDB Atlas cluster and acquire connection string.
3. Setup Cloudinary account and acquire credentials.
4. Setup Razorpay account and acquire credentials.
5. Deploy Backend and expose domain (e.g., `api.thegiftshelf.com`).
6. Update `VITE_API_URL` in both frontend apps.
7. Build Customer app and deploy static files (e.g., Vercel, Netlify, AWS S3).
8. Build Admin app and deploy static files.
