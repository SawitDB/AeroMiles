import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Sesuaikan lokasi db.js Anda

// CREATE (Tambah Mitra & Penyedia)
export async function POST(req: Request) {
  const { email_mitra, nama_mitra, tanggal_kerja_sama } = await req.json();
  
  try {
    // 1. Insert ke tabel PENYEDIA dulu (agar dapat ID)
    const penyediaRes = await pool.query('INSERT INTO AEROMILES.PENYEDIA DEFAULT VALUES RETURNING id');
    const newId = penyediaRes.rows[0].id;

    // 2. Insert ke tabel MITRA
    await pool.query(
      'INSERT INTO AEROMILES.MITRA (email_mitra, id_penyedia, nama_mitra, tanggal_kerja_sama) VALUES ($1, $2, $3, $4)',
      [email_mitra, newId, nama_mitra, tanggal_kerja_sama]
    );

    return NextResponse.json({ success: true, id_penyedia: newId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// READ (Ambil Data Mitra)
export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM AEROMILES.MITRA ORDER BY tanggal_kerja_sama DESC');
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// UPDATE (Edit Data Mitra)
export async function PUT(req: Request) {
  const { old_email, nama_mitra, tanggal_kerja_sama } = await req.json();
  
  try {
    await pool.query(
      'UPDATE AEROMILES.MITRA SET nama_mitra = $1, tanggal_kerja_sama = $2 WHERE email_mitra = $3',
      [nama_mitra, tanggal_kerja_sama, old_email]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE (Hapus Mitra)
export async function DELETE(req: Request) {
  const { email_mitra } = await req.json();

  try {
    // Karena di SQL DDL ada `ON DELETE CASCADE`, menghapus Mitra juga bisa langsung menghapus penyedia/hadiah jika foreign key diset dengan benar.
    // Namun yang paling aman adalah mencari id_penyedia dulu, lalu hapus Penyedia (karena Mitra mereferensi Penyedia)
    const res = await pool.query('SELECT id_penyedia FROM AEROMILES.MITRA WHERE email_mitra = $1', [email_mitra]);
    if(res.rows.length > 0) {
       await pool.query('DELETE FROM AEROMILES.PENYEDIA WHERE id = $1', [res.rows[0].id_penyedia]);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}