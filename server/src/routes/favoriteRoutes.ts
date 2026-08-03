import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { toggleFavorite, getMyFavorites, getMyFavoriteIds } from '../controllers/favoriteController';

const router = express.Router();

router.use(protect);
router.post('/:propertyId', toggleFavorite);
router.get('/', getMyFavorites);
router.get('/ids', getMyFavoriteIds);

export default router;
