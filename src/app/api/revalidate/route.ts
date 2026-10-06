import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getBaseApiUrl } from '@/lib/api';

// Pages that show listings; nothing else may be rebuilt through this route
const LISTING_PATHS = ['/', '/search', '/buy', '/rent', '/properties'];
const LISTING_ID = /^[A-Za-z0-9_-]{1,100}$/;

/** True when the caller's token belongs to an active admin, as the backend sees it. */
async function isAdmin(request: Request): Promise<boolean> {
  const header = request.headers.get('authorization');
  const cookieToken = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('token='))
    ?.slice('token='.length);
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : cookieToken;
  if (!token) return false;

  try {
    const res = await fetch(`${getBaseApiUrl()}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json?.data?.role === 'ADMIN' && json?.data?.isActive !== false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { id, paths } = body;

    const requested: unknown[] = Array.isArray(paths) && paths.length > 0 ? paths : LISTING_PATHS;
    const pathsToRevalidate = requested.filter(
      (path): path is string => typeof path === 'string' && LISTING_PATHS.includes(path)
    );

    if (typeof id === 'string' && LISTING_ID.test(id)) {
      pathsToRevalidate.push(`/properties/${id}`);
    }

    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
      } catch (err) {
        console.error(`Failed to revalidate path ${path}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      paths: pathsToRevalidate,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Revalidation failed' },
      { status: 500 }
    );
  }
}
