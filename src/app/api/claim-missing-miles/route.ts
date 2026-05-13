import { NextResponse } from 'next/server'
import rawPool from '@/lib/db'
// @ts-ignore
const pool: any = rawPool

// READ: Ambil semua klaim member
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const emailMember = searchParams.get('email')

    if (!emailMember) {
      return NextResponse.json({ error: 'Email member required' }, { status: 400 })
    }

    const res = await pool.query(
      `SELECT id, email_member, maskapai, bandara_asal, bandara_tujuan, tanggal_penerbangan,
              flight_number, nomor_tiket, kelas_kabin, pnr, status_penerimaan, timestamp,
              email_staf
       FROM AEROMILES.CLAIM_MISSING_MILES
       WHERE email_member = $1
       ORDER BY timestamp DESC`,
      [emailMember]
    )

    return NextResponse.json(res.rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// CREATE: Tambah klaim baru
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      email_member,
      maskapai,
      bandara_asal,
      bandara_tujuan,
      tanggal_penerbangan,
      flight_number,
      nomor_tiket,
      kelas_kabin,
      pnr,
    } = body

    // Validasi field
    if (
      !email_member ||
      !maskapai ||
      !bandara_asal ||
      !bandara_tujuan ||
      !tanggal_penerbangan ||
      !flight_number ||
      !nomor_tiket ||
      !kelas_kabin ||
      !pnr
    ) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    // Cek duplikat: email_member + flight_number + tanggal_penerbangan + nomor_tiket
    const dupCheck = await pool.query(
      `SELECT id FROM AEROMILES.CLAIM_MISSING_MILES
       WHERE email_member = $1 AND flight_number = $2 AND tanggal_penerbangan = $3 AND nomor_tiket = $4`,
      [email_member, flight_number.toUpperCase(), tanggal_penerbangan, nomor_tiket]
    )

    if (dupCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Klaim duplikat pada penerbangan yang sama tidak diperbolehkan' },
        { status: 400 }
      )
    }

    const res = await pool.query(
      `INSERT INTO AEROMILES.CLAIM_MISSING_MILES
       (email_member, maskapai, bandara_asal, bandara_tujuan, tanggal_penerbangan,
        flight_number, nomor_tiket, kelas_kabin, pnr, status_penerimaan, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Menunggu', NOW())
       RETURNING id, email_member, maskapai, bandara_asal, bandara_tujuan, tanggal_penerbangan,
                 flight_number, nomor_tiket, kelas_kabin, pnr, status_penerimaan, timestamp,
                 email_staf`,
      [
        email_member,
        maskapai.toUpperCase(),
        bandara_asal.toUpperCase(),
        bandara_tujuan.toUpperCase(),
        tanggal_penerbangan,
        flight_number.toUpperCase(),
        nomor_tiket,
        kelas_kabin,
        pnr.toUpperCase(),
      ]
    )

    return NextResponse.json({ success: true, data: res.rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// UPDATE: Edit klaim
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const {
      id,
      maskapai,
      bandara_asal,
      bandara_tujuan,
      tanggal_penerbangan,
      flight_number,
      nomor_tiket,
      kelas_kabin,
      pnr,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID klaim diperlukan' }, { status: 400 })
    }

    // Cek status, hanya bisa edit jika Menunggu
    const statusCheck = await pool.query('SELECT status_penerimaan FROM AEROMILES.CLAIM_MISSING_MILES WHERE id = $1', [
      id,
    ])

    if (statusCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Klaim tidak ditemukan' }, { status: 404 })
    }

    if (statusCheck.rows[0].status_penerimaan !== 'Menunggu') {
      return NextResponse.json(
        { error: 'Hanya klaim dengan status Menunggu yang dapat diedit' },
        { status: 400 }
      )
    }

    await pool.query(
      `UPDATE AEROMILES.CLAIM_MISSING_MILES
       SET maskapai = $1, bandara_asal = $2, bandara_tujuan = $3, tanggal_penerbangan = $4,
           flight_number = $5, nomor_tiket = $6, kelas_kabin = $7, pnr = $8
       WHERE id = $9`,
      [
        maskapai.toUpperCase(),
        bandara_asal.toUpperCase(),
        bandara_tujuan.toUpperCase(),
        tanggal_penerbangan,
        flight_number.toUpperCase(),
        nomor_tiket,
        kelas_kabin,
        pnr.toUpperCase(),
        id,
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Hapus klaim
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'ID klaim diperlukan' }, { status: 400 })
    }

    // Cek status
    const statusCheck = await pool.query('SELECT status_penerimaan FROM AEROMILES.CLAIM_MISSING_MILES WHERE id = $1', [
      id,
    ])

    if (statusCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Klaim tidak ditemukan' }, { status: 404 })
    }

    if (statusCheck.rows[0].status_penerimaan !== 'Menunggu') {
      return NextResponse.json(
        { error: 'Hanya klaim dengan status Menunggu yang dapat dihapus' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM AEROMILES.CLAIM_MISSING_MILES WHERE id = $1', [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
