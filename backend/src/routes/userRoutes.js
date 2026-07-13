import express from 'express';
import {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getAllUsers,
  updateUserStatus,
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.patch('/profile', updateProfile);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.patch('/wishlist/:productId', toggleWishlist);

router.get('/', authorizeRoles('admin', 'superadmin'), getAllUsers);
router.patch('/:id/status', authorizeRoles('admin', 'superadmin'), updateUserStatus);

export default router;