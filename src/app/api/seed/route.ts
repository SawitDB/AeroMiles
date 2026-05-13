import { NextResponse } from 'next/server'

// Simple API route to trigger DB seeding. Keep server-only.
export async function GET() {
  try {
    // Dynamic import to ensure this runs only on server and avoid client bundling
    const mod = await import('@/lib/seed.js');
    if (!mod || typeof mod.runSeed !== 'function') {
      return NextResponse.json({ ok: false, error: 'runSeed() not found' }, { status: 500 })
    }

    // Run seeding and wait for completion so caller gets definitive result
    await mod.runSeed()

    return NextResponse.json({ ok: true, message: 'Seeding started/completed' })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('/api/seed error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
