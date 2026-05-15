import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query(
      'SELECT id, harga_paket, jumlah_award_miles FROM AWARD_MILES_PACKAGE ORDER BY harga_paket ASC'
    );

    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email_member, id_award_miles_package } = await req.json();

    if (!email_member || !id_award_miles_package) {
      return NextResponse.json({ error: 'Email member dan ID package diperlukan' }, { status: 400 });
    }

    const pkgRes = await pool.query(
      'SELECT id, jumlah_award_miles, harga_paket FROM AWARD_MILES_PACKAGE WHERE id = $1',
      [id_award_miles_package]
    );

    if (pkgRes.rows.length === 0) {
      return NextResponse.json({ error: 'Package tidak ditemukan' }, { status: 404 });
    }

    const pkg = pkgRes.rows[0];

    const memberRes = await pool.query(
      'SELECT email, award_miles FROM MEMBER WHERE email = $1',
      [email_member]
    );

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'INSERT INTO MEMBER_AWARD_MILES_PACKAGE (id_award_miles_package, email_member, timestamp) VALUES ($1, $2, NOW())',
        [id_award_miles_package, email_member]
      );

      const updateRes = await client.query(
        'UPDATE MEMBER SET award_miles = award_miles + $1, total_miles = total_miles + $1 WHERE email = $2 RETURNING award_miles',
        [pkg.jumlah_award_miles, email_member]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: { award_miles: updateRes.rows[0].award_miles },
        message: `Pembelian berhasil! ${pkg.jumlah_award_miles} miles telah ditambahkan.`,
      });
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
