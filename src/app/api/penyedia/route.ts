// src/app/api/penyedia/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// READ: Mengambil dan memformat data penyedia gabungan (Maskapai & Mitra)
export async function GET() {
  try {
    const query = `
      SELECT 
        p.id,
        CASE 
          WHEN m.id_penyedia IS NOT NULL THEN m.kode_maskapai || ' – ' || m.nama_maskapai
          WHEN mi.id_penyedia IS NOT NULL THEN mi.nama_mitra || ' (Mitra)'
          ELSE 'Penyedia #' || p.id
        END as label,
        CASE 
          WHEN m.id_penyedia IS NOT NULL THEN 'maskapai'
          ELSE 'mitra'
        END as type
      FROM PENYEDIA p
      LEFT JOIN MASKAPAI m ON p.id = m.id_penyedia
      LEFT JOIN MITRA mi ON p.id = mi.id_penyedia
      ORDER BY p.id ASC;
    `;
    
    const res = await pool.query(query);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}