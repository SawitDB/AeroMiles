import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const res = await pool.query(
      `
        SELECT
          p.email,
          p.salutation,
          p.first_mid_name,
          p.last_name,
          m.nomor_member,
          m.tanggal_bergabung,
          m.id_tier,
          m.award_miles,
          m.total_miles
        FROM MEMBER m
        INNER JOIN PENGGUNA p ON p.email = m.email
        WHERE lower(m.email) = lower($1)
        LIMIT 1
      `,
      [email]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
