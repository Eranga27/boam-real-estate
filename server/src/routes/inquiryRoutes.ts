import express from 'express';
import { sendInquiry, getMyInquiries } from '../controllers/inquiryController';
import { protect, optionalAuth } from '../middlewares/authMiddleware';

const router = express.Router();

// POST /api/v1/inquiries/:propertyId — guests and users can both send inquiries
router.post('/:propertyId', optionalAuth, sendInquiry);

// GET /api/v1/inquiries/my — authenticated users see their inquiry history
router.get('/my', protect, getMyInquiries);

export default router;
