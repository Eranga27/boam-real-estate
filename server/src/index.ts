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
import requestRoutes from './routes/requestRoutes';
import { clearListingCache } from './responseCache';

dotenv.config();

const app = express();

// Render terminates TLS at its proxy; trust that one hop so req.ip is the caller, not the proxy
app.set('trust proxy', 1);

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

// Rate Limiting (100 write/auth requests per 15 minutes)
// Public reads are skipped: browser traffic arrives through the Vercel proxy, so every
// visitor would otherwise share a single bucket and one busy period would blank the site.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS',
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' })); // Input size limit for basic sanitization
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Keep-alive target: proves the server is up without touching the database, so pings keep
// Render awake while the database can still scale to zero
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: Math.round(process.uptime()) });
});

// Any successful change to listings (or to admin-managed data) drops the cached listing
// responses, so the next read comes fresh from the database
app.use(['/api/v1/properties', '/api/v1/admin'], (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    res.on('finish', () => {
      if (res.statusCode < 400) clearListingCache();
    });
  }
  next();
});

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/requests', requestRoutes);

// Return JSON for errors thrown by middleware (e.g. rejected upload file types)
// so the admin UI can show the message instead of failing to parse an HTML error page
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = err?.name === 'MulterError' ? 400 : err?.status || 500;
  res.status(status).json({ success: false, message: err?.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
