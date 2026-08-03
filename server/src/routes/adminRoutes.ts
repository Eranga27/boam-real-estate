import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware';
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllListings,
  updateListingStatus,
  deleteListing,
  getAuditLogs
} from '../controllers/adminController';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router.get('/stats', getAdminStats);

router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/properties', getAllListings);
router.put('/properties/:id', updateListingStatus);
router.delete('/properties/:id', deleteListing);

router.get('/audit-logs', getAuditLogs);

export default router;
