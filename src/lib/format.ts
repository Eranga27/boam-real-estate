import type { ListingType } from '../types/property';

/** Compact LKR price, e.g. "LKR 85 Mn" or "LKR 450 K". */
export function formatPrice(price: number, listingType: ListingType): string {
  const suffix = listingType === 'rent' ? '/mo' : '';
  if (price >= 1_000_000) {
    const value = price / 1_000_000;
    const rounded = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
    return `LKR ${rounded} Mn${suffix}`;
  }
  if (price >= 1_000) {
    return `LKR ${Math.round(price / 1000)} K${suffix}`;
  }
  return `LKR ${price.toLocaleString('en-LK')}${suffix}`;
}

/** Full LKR amount, e.g. "LKR 85,000,000". */
export function formatFullPrice(price: number): string {
  return `LKR ${price.toLocaleString('en-LK')}`;
}

export function formatDaysAgo(days: number): string {
  if (days <= 0) return 'Listed today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-LK');
}

export function getImageUrl(imagePath?: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  return `/uploads/${imagePath}`;
}