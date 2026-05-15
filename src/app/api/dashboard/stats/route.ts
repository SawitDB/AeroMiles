import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const role = searchParams.get('role')

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    if (role === 'member') {
      // Fetch consolidated transactions for member
      // 1. Transfers (Out: negative, In: positive)
      const transfers = await pool.query(`
        SELECT timestamp, 'Transfer' as jenis, 
               CASE WHEN email_member_1 = $1 THEN -jumlah ELSE jumlah END as jumlah,
               CASE WHEN email_member_1 = $1 THEN 'Ke ' || email_member_2 ELSE 'Dari ' || email_member_1 END as keterangan
        FROM TRANSFER
        WHERE email_member_1 = $1 OR email_member_2 = $1
      `, [email])

      // 2. Claims (Approved only, counts as miles added)
      const claims = await pool.query(`
        SELECT timestamp, 'Klaim' as jenis, 1000 as jumlah, 'Penerbangan ' || flight_number as keterangan
        FROM CLAIM_MISSING_MILES
        WHERE email_member = $1 AND status_penerimaan = 'Disetujui'
      `, [email])

      // 3. Redeems (Negative miles)
      const redeems = await pool.query(`
        SELECT r.timestamp, 'Redeem' as jenis, -h.miles as jumlah, h.nama as keterangan
        FROM REDEEM r
        JOIN HADIAH h ON r.kode_hadiah = h.kode_hadiah
        WHERE r.email_member = $1
      `, [email])

      // 4. Packages (Positive miles)
      const packages = await pool.query(`
        SELECT mamp.timestamp, 'Beli Paket' as jenis, amp.jumlah_award_miles as jumlah, 'Paket ' || amp.id as keterangan
        FROM MEMBER_AWARD_MILES_PACKAGE mamp
        JOIN AWARD_MILES_PACKAGE amp ON mamp.id_award_miles_package = amp.id
        WHERE mamp.email_member = $1
      `, [email])

      const allTransactions = [
        ...transfers.rows,
        ...claims.rows,
        ...redeems.rows,
        ...packages.rows
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 5)

      return NextResponse.json({ transactions: allTransactions })
    }

    if (role === 'staf') {
      // Fetch claim summary for staf
      const summary = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM CLAIM_MISSING_MILES WHERE status_penerimaan = 'Menunggu') as waiting,
          (SELECT COUNT(*) FROM CLAIM_MISSING_MILES WHERE email_staf = $1 AND status_penerimaan = 'Disetujui') as approved_by_me,
          (SELECT COUNT(*) FROM CLAIM_MISSING_MILES WHERE email_staf = $1 AND status_penerimaan = 'Ditolak') as rejected_by_me
      `, [email])

      return NextResponse.json({ summary: summary.rows[0] })
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
