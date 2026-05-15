import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    if (type === 'top-members') {
      const res = await pool.query('SELECT * FROM get_top_5_members()')
      return NextResponse.json(res.rows)
    }

    // Default: Ambil semua data member untuk list (jika diperlukan oleh laporan-transaksi)
    const res = await pool.query(`
      SELECT m.email, m.nomor_member, m.total_miles, 'member' as role
      FROM MEMBER m
      ORDER BY m.total_miles DESC
    `)
    return NextResponse.json(res.rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
