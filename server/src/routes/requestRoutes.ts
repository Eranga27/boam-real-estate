import express from 'express';
import {
  createPropertyRequest,
  getAllPropertyRequests,
  updatePropertyRequestStatus,
} from '../controllers/requestController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Public route for visitors to submit buyer request
router.post('/', createPropertyRequest);

// Admin-only routes
router.get('/admin', protect, authorize('ADMIN'), getAllPropertyRequests);
router.patch('/admin/:id/status', protect, authorize('ADMIN'), updatePropertyRequestStatus);

export default router;
