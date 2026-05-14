import { NextResponse } from 'next/server'
import pool from '@/lib/db'

// READ: Ambil riwayat transfer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const emailMember = searchParams.get('email')

    let query = `
      SELECT email_member_1, email_member_2, timestamp, jumlah, catatan
      FROM TRANSFER
      ORDER BY timestamp DESC
    `
    let params: any[] = []

    if (emailMember) {
      query = `
        SELECT email_member_1, email_member_2, timestamp, jumlah, catatan
        FROM TRANSFER
        WHERE email_member_1 = $1 OR email_member_2 = $1
        ORDER BY timestamp DESC
      `
      params = [emailMember]
    }

    const res = await pool.query(query, params)
    return NextResponse.json(res.rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// CREATE: Tambah transfer baru
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email_member_1, email_member_2, jumlah, catatan } = body

    // Validasi
    if (!email_member_1 || !email_member_2 || !jumlah) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    if (email_member_1.toLowerCase() === email_member_2.toLowerCase()) {
      return NextResponse.json({ error: 'Member tidak dapat mentransfer miles ke dirinya sendiri' }, { status: 400 })
    }

    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      return NextResponse.json({ error: 'Jumlah miles harus lebih dari 0' }, { status: 400 })
    }

    // Cek member pengirim ada
    const senderRes = await pool.query(`SELECT email FROM MEMBER WHERE email = $1`, [email_member_1])

    if (senderRes.rows.length === 0) {
      return NextResponse.json({ error: 'Member pengirim tidak ditemukan' }, { status: 404 })
    }

    // Cek member penerima ada
    const recipientRes = await pool.query(`SELECT email FROM MEMBER WHERE email = $1`, [email_member_2])

    if (recipientRes.rows.length === 0) {
      return NextResponse.json({ error: 'Member penerima tidak ditemukan' }, { status: 404 })
    }

    // Insert transfer
    const res = await pool.query(
      `INSERT INTO TRANSFER (email_member_1, email_member_2, timestamp, jumlah, catatan)
       VALUES ($1, $2, NOW(), $3, $4)
       RETURNING email_member_1, email_member_2, timestamp, jumlah, catatan`,
      [email_member_1, email_member_2, jumlah, catatan || null]
    )

    return NextResponse.json({ success: true, data: res.rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
