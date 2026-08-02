import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { uploadOnCloudinary } from '../utils/cloudinary';

export const addProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title, description, propertyType, saleOrRent, price, negotiable,
      bedrooms, bathrooms, parking, landSize, houseSize, yearBuilt,
      address, district, city, latitude, longitude,
      contactPhone, contactEmail, whatsappNumber, isDraft
    } = req.body;

    // Parse arrays correctly if they come as stringified JSON or comma separated
    let parsedAmenities = [];
    let parsedFacilities = [];
    try {
      parsedAmenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
      parsedFacilities = req.body.nearbyFacilities ? JSON.parse(req.body.nearbyFacilities) : [];
    } catch {
      parsedAmenities = req.body.amenities ? req.body.amenities.split(',') : [];
      parsedFacilities = req.body.nearbyFacilities ? req.body.nearbyFacilities.split(',') : [];
    }

    // Media upload
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imagesUrls: string[] = [];
    let videoUrl = null;

    if (files && files['images']) {
      for (const file of files['images']) {
        const url = await uploadOnCloudinary(file.path, 'image');
        if (url) imagesUrls.push(url);
      }
    }

    if (files && files['video'] && files['video'].length > 0) {
      const url = await uploadOnCloudinary(files['video'][0].path, 'video');
      if (url) videoUrl = url;
    }

    const status = isDraft === 'true' || isDraft === true ? 'DRAFT' : 'PENDING_APPROVAL';

    const property = await prisma.property.create({
      data: {
        title,
        description,
        propertyType,
        saleOrRent,
        price: parseFloat(price),
        negotiable: negotiable === 'true' || negotiable === true,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        parking: parking ? parseInt(parking) : null,
        landSize: landSize ? parseFloat(landSize) : null,
        houseSize: houseSize ? parseFloat(houseSize) : null,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        address,
        district,
        city,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        amenities: parsedAmenities,
        nearbyFacilities: parsedFacilities,
        contactPhone,
        contactEmail,
        whatsappNumber,
        images: imagesUrls,
        video: videoUrl,
        status,
        userId: req.user.id
      }
    });

    res.status(201).json({ success: true, data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const editProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Process basic fields and media similar to addProperty
    const {
      title, description, propertyType, saleOrRent, price, negotiable,
      bedrooms, bathrooms, parking, landSize, houseSize, yearBuilt,
      address, district, city, latitude, longitude,
      contactPhone, contactEmail, whatsappNumber, isDraft
    } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (propertyType) updateData.propertyType = propertyType;
    if (saleOrRent) updateData.saleOrRent = saleOrRent;
    if (price) updateData.price = parseFloat(price);
    if (negotiable !== undefined) updateData.negotiable = negotiable === 'true' || negotiable === true;
    if (bedrooms) updateData.bedrooms = parseInt(bedrooms);
    if (bathrooms) updateData.bathrooms = parseInt(bathrooms);
    if (parking) updateData.parking = parseInt(parking);
    if (landSize) updateData.landSize = parseFloat(landSize);
    if (houseSize) updateData.houseSize = parseFloat(houseSize);
    if (yearBuilt) updateData.yearBuilt = parseInt(yearBuilt);
    if (address) updateData.address = address;
    if (district) updateData.district = district;
    if (city) updateData.city = city;
    if (latitude) updateData.latitude = parseFloat(latitude);
    if (longitude) updateData.longitude = parseFloat(longitude);
    if (contactPhone) updateData.contactPhone = contactPhone;
    if (contactEmail) updateData.contactEmail = contactEmail;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    
    if (isDraft !== undefined) {
      updateData.status = (isDraft === 'true' || isDraft === true) ? 'DRAFT' : 'PENDING_APPROVAL';
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ success: true, data: updatedProperty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    await prisma.property.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const properties = await prisma.property.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: properties });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const publishListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.userId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' }
    });

    res.status(200).json({ success: true, data: updatedProperty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdatePropertyStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, data: updatedProperty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      saleOrRent, propertyType, district, city,
      minPrice, maxPrice, bedrooms, bathrooms,
      sort, limit = '20', page = '1'
    } = req.query;

    const whereClause: any = { status: 'PUBLISHED' };

    if (saleOrRent) whereClause.saleOrRent = saleOrRent as string;
    if (propertyType) whereClause.propertyType = propertyType as string;
    if (district) whereClause.district = { contains: district as string, mode: 'insensitive' };
    if (city) whereClause.city = { contains: city as string, mode: 'insensitive' };
    if (bedrooms) whereClause.bedrooms = { gte: parseInt(bedrooms as string) };
    if (bathrooms) whereClause.bathrooms = { gte: parseInt(bathrooms as string) };
    
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice as string);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice as string);
    }

    let orderByClause: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderByClause = { createdAt: 'asc' };
    else if (sort === 'price_asc') orderByClause = { price: 'asc' };
    else if (sort === 'price_desc') orderByClause = { price: 'desc' };

    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take,
        skip,
        include: {
          user: { select: { fullName: true, profilePicture: true } }
        }
      }),
      prisma.property.count({ where: whereClause })
    ]);

    res.status(200).json({ 
      success: true, 
      count: properties.length,
      total,
      totalPages: Math.ceil(total / take),
      currentPage: parseInt(page as string),
      data: properties 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { fullName: true, email: true, mobileNumber: true, profilePicture: true }
        }
      }
    });

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
