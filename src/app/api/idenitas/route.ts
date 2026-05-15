import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import pool from '@/lib/db'
import { verifyJwt, AUTH_COOKIE_NAME } from '@/lib/auth/server'

async function getMemberEmail(): Promise<string | null> {
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value

    if (!token) return null

    const payload = verifyJwt(token)

    return payload.email
  } catch {
    return null
  }
}

// ======================
// GET
// ======================
export async function GET() {
  try {
    const email = await getMemberEmail()

    if (!email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { rows } = await pool.query(
      `
      SELECT
        nomor,
        email_member,
        tanggal_habis,
        tanggal_terbit,
        negara_penerbit,
        jenis
      FROM identitas
      WHERE email_member = $1
      ORDER BY tanggal_terbit DESC
      `,
      [email]
    )

    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// ======================
// POST
// ======================
export async function POST(req: Request) {
  try {
    const email = await getMemberEmail()

    if (!email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      nomor,
      tanggal_habis,
      tanggal_terbit,
      negara_penerbit,
      jenis,
    } = await req.json()

    if (
      !nomor ||
      !tanggal_habis ||
      !tanggal_terbit ||
      !negara_penerbit ||
      !jenis
    ) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // cek nomor unik
    const dupCheck = await pool.query(
      `
      SELECT nomor
      FROM identitas
      WHERE nomor = $1
      `,
      [nomor]
    )

    if (dupCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Nomor dokumen sudah terdaftar' },
        { status: 400 }
      )
    }

    const { rows } = await pool.query(
      `
      INSERT INTO identitas (
        nomor,
        email_member,
        tanggal_habis,
        tanggal_terbit,
        negara_penerbit,
        jenis
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        nomor,
        email,
        tanggal_habis,
        tanggal_terbit,
        negara_penerbit,
        jenis,
      ]
    )

    return NextResponse.json({
      success: true,
      data: rows[0],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// ======================
// PUT
// ======================
export async function PUT(req: Request) {
  try {
    const email = await getMemberEmail()

    if (!email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      nomor,
      tanggal_habis,
      tanggal_terbit,
      negara_penerbit,
      jenis,
    } = await req.json()

    if (!nomor) {
      return NextResponse.json(
        { error: 'Nomor diperlukan' },
        { status: 400 }
      )
    }

    const ownerCheck = await pool.query(
      `
      SELECT nomor
      FROM identitas
      WHERE nomor = $1
      AND email_member = $2
      `,
      [nomor, email]
    )

    if (ownerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Identitas tidak ditemukan' },
        { status: 404 }
      )
    }

    await pool.query(
      `
      UPDATE identitas
      SET
        tanggal_habis = $1,
        tanggal_terbit = $2,
        negara_penerbit = $3,
        jenis = $4
      WHERE nomor = $5
      AND email_member = $6
      `,
      [
        tanggal_habis,
        tanggal_terbit,
        negara_penerbit,
        jenis,
        nomor,
        email,
      ]
    )

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// ======================
// DELETE
// ======================
export async function DELETE(req: Request) {
  try {
    const email = await getMemberEmail()

    if (!email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { nomor } = await req.json()

    if (!nomor) {
      return NextResponse.json(
        { error: 'Nomor diperlukan' },
        { status: 400 }
      )
    }

    const ownerCheck = await pool.query(
      `
      SELECT nomor
      FROM identitas
      WHERE nomor = $1
      AND email_member = $2
      `,
      [nomor, email]
    )

    if (ownerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Identitas tidak ditemukan' },
        { status: 404 }
      )
    }

    await pool.query(
      `
      DELETE FROM identitas
      WHERE nomor = $1
      AND email_member = $2
      `,
      [nomor, email]
    )

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}