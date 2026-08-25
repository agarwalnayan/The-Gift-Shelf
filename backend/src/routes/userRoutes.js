import express from 'express';
import {
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getAllUsers,
  getCustomers,
  getUserById,
  updateUserStatus,
  resetUserPassword,
  searchUsers,
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.patch('/wishlist/:productId', toggleWishlist);

router.get('/', authorizeRoles('admin', 'superadmin'), getAllUsers);
router.get('/search', authorizeRoles('admin', 'superadmin'), searchUsers);
router.get('/customers', authorizeRoles('admin', 'superadmin'), getCustomers);
router.get('/:id', authorizeRoles('admin', 'superadmin'), getUserById);
router.patch('/:id/status', authorizeRoles('admin', 'superadmin'), updateUserStatus);
router.patch('/:id/reset-password', authorizeRoles('admin', 'superadmin'), resetUserPassword);

export default router;