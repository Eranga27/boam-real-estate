import express from 'express';
import { getMe, updateDetails, updatePassword, uploadProfilePicture, deleteAccount } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

router.use(protect); // All routes below are protected

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);
router.post('/upload-profile-picture', upload.single('image'), uploadProfilePicture);
router.delete('/delete-account', deleteAccount);

export default router;
