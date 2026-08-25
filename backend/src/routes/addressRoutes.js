import express from 'express';
import { lookupPincode } from '../controllers/addressController.js';

const router = express.Router();

router.get('/pincode/:pincode', lookupPincode);

export default router;