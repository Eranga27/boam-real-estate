import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getDashboardStats } from '../controllers/dashboardController';

const router = express.Router();

router.use(protect);
router.get('/stats', getDashboardStats);

export default router;
