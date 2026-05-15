import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Semua member (untuk halaman Kelola Member)
export async function GET() {
  try {
    const res = await pool.query(`
      SELECT
        p.email,
        p.salutation,
        p.first_mid_name,
        p.last_name,
        p.country_code,
        p.mobile_number,
        p.tanggal_lahir,
        p.kewarganegaraan,
        m.nomor_member,
        m.tanggal_bergabung,
        m.id_tier,
        m.award_miles,
        m.total_miles
      FROM MEMBER m
      INNER JOIN PENGGUNA p ON p.email = m.email
      ORDER BY m.nomor_member
    `);

    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Tambah member baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email, password, salutation, first_mid_name, last_name,
      country_code, mobile_number, tanggal_lahir, kewarganegaraan
    } = body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert ke PENGGUNA
      await client.query(`
        INSERT INTO PENGGUNA 
          (email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan)
        VALUES ($1, crypt($2, gen_salt('bf', 10)), $3, $4, $5, $6, $7, $8, $9)
      `, [email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan]);

      // Insert ke MEMBER (nomor_member & id_tier otomatis)
      const memberRes = await client.query(`
        INSERT INTO MEMBER (email, tanggal_bergabung, id_tier)
        VALUES ($1, CURRENT_DATE, 'BLUE')
        RETURNING *
      `, [email]);

      await client.query('COMMIT');
      return NextResponse.json(memberRes.rows[0], { status: 201 });
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