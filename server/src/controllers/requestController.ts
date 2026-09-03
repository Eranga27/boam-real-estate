import { Request, Response } from 'express';
import prisma from '../prisma';
import { sendPropertyRequestNotificationEmail } from '../utils/email';

export const createPropertyRequest = async (req: Request, res: Response) => {
  try {
    const {
      lookingFor,
      district,
      customArea,
      minBudget,
      maxBudget,
      sizeInPerches,
      name,
      email,
      phone,
      note,
    } = req.body;

    if (!lookingFor || !district || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Looking for, district, name, email, and phone are required.',
      });
    }

    const minBudgetNum = minBudget !== undefined && minBudget !== '' ? parseFloat(minBudget) : null;
    const maxBudgetNum = maxBudget !== undefined && maxBudget !== '' ? parseFloat(maxBudget) : null;
    const sizeNum = sizeInPerches !== undefined && sizeInPerches !== '' ? parseFloat(sizeInPerches) : null;

    const propertyRequest = await prisma.propertyRequest.create({
      data: {
        lookingFor,
        district,
        customArea: customArea || null,
        minBudget: minBudgetNum && !isNaN(minBudgetNum) ? minBudgetNum : null,
        maxBudget: maxBudgetNum && !isNaN(maxBudgetNum) ? maxBudgetNum : null,
        sizeInPerches: sizeNum && !isNaN(sizeNum) ? sizeNum : null,
        name,
        email,
        phone,
        note: note || null,
      },
    });

    // Asynchronously send email notification to admin emails
    sendPropertyRequestNotificationEmail({
      lookingFor,
      district,
      customArea: customArea || undefined,
      minBudget: minBudgetNum && !isNaN(minBudgetNum) ? minBudgetNum : undefined,
      maxBudget: maxBudgetNum && !isNaN(maxBudgetNum) ? maxBudgetNum : undefined,
      sizeInPerches: sizeNum && !isNaN(sizeNum) ? sizeNum : undefined,
      name,
      email,
      phone,
      note: note || undefined,
    }).catch((err) => console.error('Error sending request notification email:', err));

    return res.status(201).json({
      success: true,
      message: 'Property request submitted successfully',
      data: propertyRequest,
    });
  } catch (error) {
    console.error('Error creating property request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit property request',
    });
  }
};

export const getAllPropertyRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.propertyRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching property requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch property requests',
    });
  }
};

export const updatePropertyRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['NEW', 'CONTACTED', 'CLOSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be NEW, CONTACTED, or CLOSED.',
      });
    }

    const updated = await prisma.propertyRequest.update({
      where: { id },
      data: { status: status as any },
    });

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating property request status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update property request status',
    });
  }
};
