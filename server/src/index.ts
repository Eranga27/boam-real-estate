import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import propertyRoutes from './routes/propertyRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();

// Security Hardening
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Echo requesting origin to support credentials across vercel/production domains
      callback(null, origin || true);
    },
    credentials: true,
  })
);

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' })); // Input size limit for basic sanitization
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
