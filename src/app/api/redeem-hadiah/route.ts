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
      `SELECT r.email_member, r.kode_hadiah, r.timestamp, h.nama as nama_hadiah, h.miles as miles_used
       FROM REDEEM r
       JOIN HADIAH h ON h.kode_hadiah = r.kode_hadiah
       WHERE r.email_member = $1
       ORDER BY r.timestamp DESC`,
      [email]
    );

    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email_member, kode_hadiah } = await req.json();

    if (!email_member || !kode_hadiah) {
      return NextResponse.json({ error: 'Email member dan kode hadiah diperlukan' }, { status: 400 });
    }

    const hadiahRes = await pool.query(
      'SELECT nama, miles, valid_start_date, program_end FROM HADIAH WHERE kode_hadiah = $1',
      [kode_hadiah]
    );

    if (hadiahRes.rows.length === 0) {
      return NextResponse.json({ error: 'Hadiah tidak ditemukan' }, { status: 404 });
    }

    const hadiah = hadiahRes.rows[0];

    if (new Date(hadiah.program_end) < new Date()) {
      return NextResponse.json({ error: 'Hadiah sudah tidak tersedia (program telah berakhir)' }, { status: 400 });
    }

    if (new Date(hadiah.valid_start_date) > new Date()) {
      return NextResponse.json({ error: 'Hadiah belum tersedia (program belum dimulai)' }, { status: 400 });
    }

    const memberRes = await pool.query(
      'SELECT award_miles FROM MEMBER WHERE email = $1',
      [email_member]
    );

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 });
    }

    const awardMiles = memberRes.rows[0].award_miles;

    if (awardMiles < hadiah.miles) {
      return NextResponse.json(
        { error: `Award miles tidak cukup. Dibutuhkan ${hadiah.miles} miles, tersedia ${awardMiles} miles.` },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'INSERT INTO REDEEM (email_member, kode_hadiah, timestamp) VALUES ($1, $2, NOW())',
        [email_member, kode_hadiah]
      );

      await client.query('COMMIT');

      return NextResponse.json({ success: true, message: `Redeem berhasil! ${hadiah.miles} miles telah dipotong.` });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
