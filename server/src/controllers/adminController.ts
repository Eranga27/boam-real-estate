import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

const logAdminAction = async (adminId: string, action: string, details: string, targetId?: string) => {
  await prisma.auditLog.create({
    data: { adminId, action, details, targetId }
  });
};

export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalListings,
      totalInquiries,
      pendingListings,
      recentUsers,
      recentListings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.inquiry.count(),
      prisma.property.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, fullName: true, email: true, createdAt: true, role: true } }),
      prisma.property.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, status: true, price: true, createdAt: true, user: { select: { fullName: true } } } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        totalInquiries,
        pendingListings,
        recentUsers,
        recentListings
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      OR: [
        { fullName: { contains: String(search), mode: 'insensitive' as any } },
        { email: { contains: String(search), mode: 'insensitive' as any } },
      ]
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true }
      }),
      prisma.user.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive, role }
    });

    await logAdminAction(req.user.id, 'UPDATE_USER', `Updated user ${user.email} (Active: ${isActive}, Role: ${role})`, user.id);

    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    await prisma.user.delete({ where: { id } });
    await logAdminAction(req.user.id, 'DELETE_USER', `Deleted user ${user.email}`, id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      title: { contains: String(search), mode: 'insensitive' }
    };

    if (status) {
      where.status = status;
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true } } }
      }),
      prisma.property.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: { properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateListingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;

    const property = await prisma.property.update({
      where: { id },
      data: { status, isFeatured }
    });

    await logAdminAction(req.user.id, 'UPDATE_LISTING', `Updated listing ${property.title} (Status: ${status}, Featured: ${isFeatured})`, property.id);

    res.status(200).json({ success: true, message: 'Listing updated successfully', data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }

    await prisma.property.delete({ where: { id } });
    await logAdminAction(req.user.id, 'DELETE_LISTING', `Deleted listing ${property.title}`, id);

    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { fullName: true, email: true } } }
      }),
      prisma.auditLog.count()
    ]);

    res.status(200).json({
      success: true,
      data: { logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
