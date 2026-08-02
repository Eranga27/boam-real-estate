import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendInquiryEmail, sendInquiryConfirmationEmail } from '../utils/email';

// Simple in-memory spam prevention: track ip -> last inquiry timestamps
const inquiryRateMap = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // max 5 inquiries per IP per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (inquiryRateMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  inquiryRateMap.set(ip, timestamps);
  return false;
}

/**
 * POST /api/v1/inquiries/:propertyId
 * Sends inquiry email to seller and saves inquiry to DB.
 * Works for both guests and authenticated users.
 */
export const sendInquiry = async (req: Request | AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const { senderName, senderEmail, senderPhone, message } = req.body;

    // --- Validation ---
    if (!senderName?.trim() || !senderEmail?.trim() || !message?.trim()) {
      res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }
    if (message.trim().length < 10) {
      res.status(400).json({ success: false, message: 'Message must be at least 10 characters.' });
      return;
    }
    if (message.trim().length > 1000) {
      res.status(400).json({ success: false, message: 'Message must not exceed 1000 characters.' });
      return;
    }

    // --- Spam prevention ---
    const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      res.status(429).json({ success: false, message: 'Too many inquiries. Please wait before sending another.' });
      return;
    }

    // --- Fetch property with seller info ---
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found.' });
      return;
    }
    if (property.status !== 'PUBLISHED') {
      res.status(403).json({ success: false, message: 'This property is not currently available.' });
      return;
    }

    // Prevent sellers from contacting themselves
    const authReq = req as AuthRequest;
    if (authReq.user && authReq.user.id === property.userId) {
      res.status(400).json({ success: false, message: 'You cannot send an inquiry to your own listing.' });
      return;
    }

    // --- Save inquiry to DB ---
    const inquiry = await prisma.inquiry.create({
      data: {
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim().toLowerCase(),
        senderPhone: senderPhone?.trim() || null,
        message: message.trim(),
        propertyId,
        buyerId: authReq.user?.id || null,
        ipAddress: ip,
      },
    });

    // --- Send emails concurrently ---
    const [emailSent] = await Promise.all([
      sendInquiryEmail({
        sellerEmail: property.contactEmail,
        sellerName: property.user.fullName,
        buyerName: senderName.trim(),
        buyerEmail: senderEmail.trim(),
        buyerPhone: senderPhone?.trim(),
        propertyTitle: property.title,
        propertyId: property.id,
        message: message.trim(),
      }),
      sendInquiryConfirmationEmail({
        buyerEmail: senderEmail.trim(),
        buyerName: senderName.trim(),
        propertyTitle: property.title,
        propertyId: property.id,
      }),
    ]);

    res.status(201).json({
      success: true,
      emailSent,
      message: emailSent
        ? 'Your inquiry has been sent to the seller! Check your email for confirmation.'
        : 'Inquiry saved. The seller will be notified shortly.',
      data: { id: inquiry.id },
    });
  } catch (error: any) {
    console.error('sendInquiry error:', error);
    res.status(500).json({ success: false, message: 'Failed to send inquiry. Please try again.' });
  }
};

/**
 * GET /api/v1/inquiries/my
 * Returns all inquiries sent by the authenticated user (inquiry history).
 */
export const getMyInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            city: true,
            district: true,
            saleOrRent: true,
            status: true,
          },
        },
      },
    });
    res.status(200).json({ success: true, data: inquiries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
