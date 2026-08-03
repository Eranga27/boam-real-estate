import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

/** Dashboard overview stats for the authenticated user */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const [
      totalListings,
      publishedListings,
      draftListings,
      pendingListings,
      rejectedListings,
      totalInquiriesReceived,
      totalInquiriesSent,
      totalFavorites,
      recentListings,
      recentInquiries,
    ] = await Promise.all([
      prisma.property.count({ where: { userId } }),
      prisma.property.count({ where: { userId, status: 'PUBLISHED' } }),
      prisma.property.count({ where: { userId, status: 'DRAFT' } }),
      prisma.property.count({ where: { userId, status: 'PENDING_APPROVAL' } }),
      prisma.property.count({ where: { userId, status: 'REJECTED' } }),
      prisma.inquiry.count({ where: { property: { userId } } }),
      prisma.inquiry.count({ where: { buyerId: userId } }),
      prisma.favorite.count({ where: { userId } }),
      prisma.property.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, title: true, status: true, price: true,
          images: true, city: true, saleOrRent: true, createdAt: true,
          _count: { select: { inquiries: true } },
        },
      }),
      prisma.inquiry.findMany({
        where: { property: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          property: { select: { id: true, title: true, images: true } },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        listings: { total: totalListings, published: publishedListings, draft: draftListings, pending: pendingListings, rejected: rejectedListings },
        inquiriesReceived: totalInquiriesReceived,
        inquiriesSent: totalInquiriesSent,
        favorites: totalFavorites,
        recentListings,
        recentInquiries,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
