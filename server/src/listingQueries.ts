import { Prisma } from '@prisma/client';
import prisma from './prisma';

/**
 * Listing photos uploaded without Cloudinary are stored in the database as Base64 text, so
 * reading a row's `images` column pulls every photo (megabytes per listing) out of Postgres.
 * List views only need the cover, so they select every other column and read the first
 * photo on its own.
 */

/** Every Property column except `images` */
export const propertyWithoutImages = Object.fromEntries(
  Object.values(Prisma.PropertyScalarFieldEnum)
    .filter((field) => field !== 'images')
    .map((field) => [field, true])
) as Prisma.PropertySelect;

/** Cover photo (first image) and photo count per listing, one array element per row */
async function loadCovers(ids: string[]): Promise<Map<string, { cover: string | null; count: number }>> {
  if (ids.length === 0) return new Map();
  const rows = await prisma.$queryRaw<{ id: string; cover: string | null; count: number | null }[]>`
    SELECT id, images[1] AS cover, COALESCE(array_length(images, 1), 0)::int AS count
    FROM "Property"
    WHERE id = ANY(${ids})
  `;
  return new Map(rows.map((row) => [row.id, { cover: row.cover, count: Number(row.count) || 0 }]));
}

/** Rows selected without `images`, given `images: [cover]` and `imageCount` */
export async function withCovers<T extends { id: string }>(rows: T[]): Promise<(T & { images: string[]; imageCount: number })[]> {
  const covers = await loadCovers(rows.map((row) => row.id));
  return rows.map((row) => {
    const cover = covers.get(row.id);
    return { ...row, images: cover?.cover ? [cover.cover] : [], imageCount: cover?.count ?? 0 };
  });
}
