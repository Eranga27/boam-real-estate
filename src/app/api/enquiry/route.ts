import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { properties } from '@/data/properties';
import { getPropertyUrl, SITE_SEO } from '@/lib/site';

export const runtime = 'nodejs';

// Lightweight in-memory rate limiter (5 enquiries per IP per hour)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function hasCrlf(str: string): boolean {
  return /[\r\n]/.test(str);
}

export async function POST(req: Request) {
  try {
    // 1. IP Rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many enquiries sent. Please wait an hour before trying again.' },
        { status: 429 }
      );
    }

    // 2. Parse payload
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    const { senderName, senderEmail, senderPhone, message, propertyId, website } = body || {};

    // 3. Honeypot check for bots
    if (website && typeof website === 'string' && website.trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Your enquiry has been sent. BOAM will get back to you.',
      });
    }

    // 4. Server-side validation
    if (!senderName || typeof senderName !== 'string' || !senderName.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name is required.' },
        { status: 400 }
      );
    }

    const cleanName = senderName.trim();
    if (cleanName.length < 2 || cleanName.length > 100 || hasCrlf(cleanName)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid name (2–100 characters).' },
        { status: 400 }
      );
    }

    if (!senderEmail || typeof senderEmail !== 'string' || !senderEmail.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = senderEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 150 || hasCrlf(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    let cleanPhone = '';
    if (senderPhone && typeof senderPhone === 'string' && senderPhone.trim()) {
      cleanPhone = senderPhone.trim();
      const phoneRegex = /^[0-9+\-() ]*$/;
      if (cleanPhone.length > 20 || !phoneRegex.test(cleanPhone) || hasCrlf(cleanPhone)) {
        return NextResponse.json(
          { success: false, message: 'Please enter a valid phone number.' },
          { status: 400 }
        );
      }
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message is required.' },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim();
    if (cleanMessage.length < 10 || cleanMessage.length > 1000) {
      return NextResponse.json(
        { success: false, message: 'Message must be between 10 and 1000 characters.' },
        { status: 400 }
      );
    }

    if (!propertyId || typeof propertyId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Property ID is required.' },
        { status: 400 }
      );
    }

    // 5. Validate property against static catalogue
    const property = properties.find((p) => p.id === propertyId);
    if (!property) {
      return NextResponse.json(
        { success: false, message: 'Invalid property.' },
        { status: 400 }
      );
    }

    // Server-derived property information
    const propertyUrl = getPropertyUrl(property.id);
    const destinationEmail = process.env.ENQUIRY_TO_EMAIL || SITE_SEO.contactEmail;

    // 6. Check SMTP credentials
    const host = process.env.ENQUIRY_EMAIL_HOST;
    const port = parseInt(process.env.ENQUIRY_EMAIL_PORT || '587', 10);
    const user = process.env.ENQUIRY_EMAIL_USER;
    const pass = process.env.ENQUIRY_EMAIL_PASS;

    if (!host || !user || !pass) {
      console.warn('[Enquiry API] SMTP credentials not configured in environment variables.');
      return NextResponse.json(
        { success: false, message: 'Unable to send your enquiry right now. Please call or WhatsApp BOAM directly.' },
        { status: 500 }
      );
    }

    // 7. Send Email via Nodemailer
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const mailSubject = `New Property Enquiry — ${property.title}`;
    const textContent = [
      `Property:`,
      `${property.title}`,
      ``,
      `Property URL:`,
      `${propertyUrl}`,
      ``,
      `Name:`,
      `${cleanName}`,
      ``,
      `Email:`,
      `${cleanEmail}`,
      ``,
      `Phone:`,
      `${cleanPhone || 'Not provided'}`,
      ``,
      `Message:`,
      `${cleanMessage}`,
    ].join('\n');

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #0f172a;">New Property Enquiry</h2>
        <p style="font-size: 14px; color: #475569;">You received a new inquiry from the BOAM Real Estates platform.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Property URL:</strong> <a href="${propertyUrl}" style="color: #2563eb;">${propertyUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> <a href="mailto:${cleanEmail}" style="color: #2563eb;">${cleanEmail}</a></p>
        <p><strong>Phone:</strong> ${cleanPhone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${cleanMessage}</div>
      </div>
    `;

    await transporter.sendMail({
      from: `"BOAM Real Estates Enquiry" <${user}>`,
      to: destinationEmail,
      replyTo: cleanEmail,
      subject: mailSubject,
      text: textContent,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: 'Your enquiry has been sent. BOAM will get back to you.',
    });
  } catch (err: any) {
    console.error('[Enquiry API] SMTP send failed:', err?.message || 'Unknown error');
    return NextResponse.json(
      { success: false, message: 'Unable to send your enquiry right now. Please call or WhatsApp BOAM directly.' },
      { status: 500 }
    );
  }
}
