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

// Without a secret every login fails and tokens can't be checked; stop at startup with a
// clear message instead of failing on each request
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Add it to the environment before starting the server.');
  process.exit(1);
}

// Sites allowed to call the API from a browser with credentials. Most browser traffic comes
// through the Vercel same-origin proxy and never needs CORS; this covers direct calls.
const allowedOrigins = new Set(
  [
    'https://boamrealestates.com',
    'https://www.boamrealestates.com',
    process.env.FRONTEND_URL,
  ]
    .filter((origin): origin is string => Boolean(origin))
    .map((origin) => origin.trim().replace(/\/+$/, ''))
);
// The project's Vercel production and preview domains (boam-realestate.vercel.app,
// boam-realestate-git-<branch>-<team>.vercel.app, ...)
const vercelOrigin = /^https:\/\/boam-?real-?estates?(-[a-z0-9-]+)?\.vercel\.app$/;
const isAllowedOrigin = (origin: string) =>
  allowedOrigins.has(origin) ||
  vercelOrigin.test(origin) ||
  (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin));

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
      // No Origin header: server-to-server calls (Vercel proxy, uptime pings), not a browser
      // on another site. Unknown origins get no CORS headers, so the browser blocks them.
      callback(null, !origin || isAllowedOrigin(origin));
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
