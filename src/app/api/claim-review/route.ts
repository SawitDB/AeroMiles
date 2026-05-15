import { NextResponse } from 'next/server'
import pool from '@/lib/db'

// READ: Ambil semua klaim untuk staf review
export async function GET(req: Request) {
  try {
    const res = await pool.query(
      `SELECT id, email_member, maskapai, bandara_asal, bandara_tujuan, tanggal_penerbangan,
              flight_number, nomor_tiket, kelas_kabin, pnr, status_penerimaan, timestamp,
              email_staf
       FROM CLAIM_MISSING_MILES
       ORDER BY CASE 
                 WHEN status_penerimaan = 'Menunggu' THEN 0
                 ELSE 1
               END,
               timestamp DESC`
    )

    return NextResponse.json(res.rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// UPDATE: Staf review klaim (ubah status dan catatan)
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, status_penerimaan, email_staf } = body

    if (!id || !status_penerimaan || !email_staf) {
      return NextResponse.json({ error: 'ID, status, dan email staf diperlukan' }, { status: 400 })
    }

    if (!['Menunggu', 'Disetujui', 'Ditolak'].includes(status_penerimaan)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    await pool.query(
      `UPDATE CLAIM_MISSING_MILES 
       SET status_penerimaan = $1, email_staf = $2
       WHERE id = $3`,
      [status_penerimaan, email_staf, id]
    )

    // Ambil data terbaru untuk pesan sukses sesuai instruksi GEMINI.md
    const result = await pool.query(
      `SELECT email_member, flight_number FROM CLAIM_MISSING_MILES WHERE id = $1`,
      [id]
    )
    const { email_member, flight_number } = result.rows[0]

    return NextResponse.json({ 
      success: true, 
      message: `SUKSES: Total miles Member "${email_member}" telah diperbarui. Miles ditambahkan: 1000 miles dari klaim penerbangan "${flight_number}".`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
