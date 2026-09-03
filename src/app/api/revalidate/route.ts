import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, paths } = body;

    // Paths specified to revalidate
    const pathsToRevalidate = Array.isArray(paths) && paths.length > 0
      ? paths
      : ['/', '/search', '/buy', '/rent'];

    if (id) {
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
