import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';
import {
  addProperty,
  editProperty,
  deleteProperty,
  getMyProperties,
  publishListing,
  adminUpdatePropertyStatus,
  getAllProperties,
  getPropertyById
} from '../controllers/propertyController';

const router = express.Router();

// Public routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// Protected user routes
router.use(protect);
router.get('/me/listings', getMyProperties);
router.post(
  '/', 
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), 
  addProperty
);
router.put(
  '/:id', 
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), 
  editProperty
);
router.delete('/:id', deleteProperty);
router.put('/:id/publish', publishListing);

// Admin routes
router.put('/:id/status', authorize('ADMIN'), adminUpdatePropertyStatus);

export default router;
