/**
 * BOAM Real Estates — Centralized Broker Contact Helpers
 *
 * Single source of truth for all tel:, mailto:, and WhatsApp URLs.
 * Always consumes SITE_SEO — never hardcode contact details elsewhere.
 */

import { SITE_SEO } from './site';

// ---------------------------------------------------------------------------
// Internal URL helpers
// ---------------------------------------------------------------------------

/**
 * Returns the canonical site origin for use in outbound contact links
 * (WhatsApp messages, email bodies).
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL env var (set in production / Vercel)
 * 2. Hardcoded production domain (safe fallback — never localhost)
 *
 * Deliberately does NOT use window.location.origin so that WhatsApp
 * and email links always contain the real production URL, not localhost.
 */
function getCanonicalOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  return 'https://boamrealestates.com';
}

/**
 * Returns the canonical URL for a property listing.
 * Safe for use in outbound links — never produces a localhost URL.
 */
function getCanonicalPropertyUrl(propertyId: string): string {
  return `${getCanonicalOrigin()}/properties/${encodeURIComponent(propertyId)}`;
}

// ---------------------------------------------------------------------------
// Plain contact link helpers
// ---------------------------------------------------------------------------

/** tel: href — e.g. href={getPhoneHref()} */
export function getPhoneHref(): string {
  const digits = SITE_SEO.contactPhone.replace(/[^0-9+]/g, '');
  return `tel:${digits}`;
}

/** mailto: href without property context */
export function getEmailHref(): string {
  return `mailto:${SITE_SEO.contactEmail}`;
}

/** WhatsApp link without property context */
export function getWhatsAppHref(): string {
  const num = SITE_SEO.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${num}`;
}

// ---------------------------------------------------------------------------
// Property-aware contact helpers
// ---------------------------------------------------------------------------

/**
 * WhatsApp URL pre-filled with structured property context.
 *
 * Message format:
 *   Hello BOAM, I'm interested in:
 *
 *   [Property Title]
 *
 *   [Canonical Property URL]
 *
 * Uses the canonical production URL — never localhost.
 */
export function getPropertyWhatsAppHref(propertyId: string, propertyTitle: string): string {
  const num = SITE_SEO.whatsappNumber.replace(/[^0-9]/g, '');
  const url = getCanonicalPropertyUrl(propertyId);
  const text = `Hello BOAM, I'm interested in:\n\n${propertyTitle}\n\n${url}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/**
 * mailto: href pre-filled with property subject and body.
 *
 * Subject: Enquiry: [Property Title]
 * Body:
 *   Hi BOAM,
 *
 *   I am interested in [Property Title].
 *
 *   Property:
 *   [Canonical Property URL]
 *
 *   Please provide more information.
 *
 * Uses the canonical production URL — never localhost.
 */
export function getPropertyEmailHref(propertyId: string, propertyTitle: string): string {
  const url = getCanonicalPropertyUrl(propertyId);
  const subject = `Enquiry: ${propertyTitle}`;
  const body = [
    'Hi BOAM,',
    '',
    `I am interested in ${propertyTitle}.`,
    '',
    'Property:',
    url,
    '',
    'Please provide more information.',
  ].join('\n');
  return `mailto:${SITE_SEO.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ---------------------------------------------------------------------------
// Display strings (for UI labels — not for href)
// ---------------------------------------------------------------------------

/** Formatted phone number for display, e.g. "+94 777 80 1470" */
export const BROKER_PHONE_DISPLAY = SITE_SEO.contactPhone;

/** Email address for display */
export const BROKER_EMAIL_DISPLAY = SITE_SEO.contactEmail;
