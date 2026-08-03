import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

/** Toggle a property as favorite (add if not exists, remove if exists) */
export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { userId_propertyId: { userId, propertyId } } });
      res.status(200).json({ success: true, favorited: false, message: 'Removed from favorites' });
    } else {
      await prisma.favorite.create({ data: { userId, propertyId } });
      res.status(201).json({ success: true, favorited: true, message: 'Added to favorites' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Get all favorited properties for the authenticated user */
export const getMyFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          include: {
            user: { select: { fullName: true, profilePicture: true } },
          },
        },
      },
    });
    res.status(200).json({ success: true, data: favorites.map((f) => f.property) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Get favorite property IDs for quick UI checks */
export const getMyFavoriteIds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      select: { propertyId: true },
    });
    res.status(200).json({ success: true, data: favorites.map((f) => f.propertyId) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
