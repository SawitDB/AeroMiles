// src/app/api/hadiah/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// READ: Mengambil data hadiah (opsional filter available=true)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const availableOnly = searchParams.get('available') === 'true';

    let query = `
      SELECT
        h.kode_hadiah, h.nama, h.miles, h.deskripsi,
        h.valid_start_date, h.program_end, h.id_penyedia,
        CASE
          WHEN mk.id_penyedia IS NOT NULL THEN mk.kode_maskapai || ' - ' || mk.nama_maskapai
          WHEN mi.id_penyedia IS NOT NULL THEN mi.nama_mitra || ' (Mitra)'
          ELSE 'Penyedia #' || h.id_penyedia
        END as nama_penyedia
      FROM HADIAH h
      LEFT JOIN MASKAPAI mk ON h.id_penyedia = mk.id_penyedia
      LEFT JOIN MITRA mi ON h.id_penyedia = mi.id_penyedia
    `;

    if (availableOnly) {
      query += ` WHERE h.program_end >= CURRENT_DATE ORDER BY h.kode_hadiah ASC`;
    } else {
      query += ` ORDER BY h.kode_hadiah ASC`;
    }

    const res = await pool.query(query);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE: Menambah hadiah baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, miles, deskripsi, valid_start_date, program_end, id_penyedia } = body;

    // kode_hadiah akan otomatis digenerate oleh database (RWD-XXX) sesuai default DDL
    const res = await pool.query(
      `INSERT INTO HADIAH 
      (nama, miles, deskripsi, valid_start_date, program_end, id_penyedia) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nama, miles, deskripsi, valid_start_date, program_end, id_penyedia]
    );

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE: Mengubah data hadiah
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { kode_hadiah, nama, miles, deskripsi, valid_start_date, program_end, id_penyedia } = body;

    await pool.query(
      `UPDATE HADIAH 
       SET nama = $1, miles = $2, deskripsi = $3, valid_start_date = $4, program_end = $5, id_penyedia = $6 
       WHERE kode_hadiah = $7`,
      [nama, miles, deskripsi, valid_start_date, program_end, id_penyedia, kode_hadiah]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Menghapus hadiah
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { kode_hadiah } = body;

    await pool.query('DELETE FROM HADIAH WHERE kode_hadiah = $1', [kode_hadiah]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}