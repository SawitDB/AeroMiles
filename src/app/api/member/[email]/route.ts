import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Single member (kode kamu yang sudah ada, pindah ke sini)
export async function GET(req: Request, { params }: { params: { email: string } }) {
  try {
    const email = params.email;

    const res = await pool.query(`
      SELECT
        p.email, p.salutation, p.first_mid_name, p.last_name,
        p.country_code, p.mobile_number, p.tanggal_lahir, p.kewarganegaraan,
        m.nomor_member, m.tanggal_bergabung, m.id_tier, m.award_miles, m.total_miles
      FROM MEMBER m
      INNER JOIN PENGGUNA p ON p.email = m.email
      WHERE lower(m.email) = lower($1)
      LIMIT 1
    `, [email]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Edit member
export async function PUT(req: Request, { params }: { params: { email: string } }) {
  try {
    const email = params.email;
    const body = await req.json();
    const {
      salutation, first_mid_name, last_name,
      country_code, mobile_number, tanggal_lahir,
      kewarganegaraan, id_tier
    } = body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        UPDATE PENGGUNA SET
          salutation = $1, first_mid_name = $2, last_name = $3,
          country_code = $4, mobile_number = $5,
          tanggal_lahir = $6, kewarganegaraan = $7
        WHERE email = $8
      `, [salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan, email]);

      await client.query(`
        UPDATE MEMBER SET id_tier = $1 WHERE email = $2
      `, [id_tier, email]);

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Hapus member (cascade ke Identitas, Klaim, Transfer, Redeem)
export async function DELETE(req: Request, { params }: { params: { email: string } }) {
  try {
    const email = params.email;

    // ON DELETE CASCADE di DDL sudah handle tabel terkait
    await pool.query(`DELETE FROM MEMBER WHERE email = $1`, [email]);
    await pool.query(`DELETE FROM PENGGUNA WHERE email = $1`, [email]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}