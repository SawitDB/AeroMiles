import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db';

export async function runSeed() {
  const client = await pool.connect();
  
  try {
    // 1. Cek apakah skema AEROMILES dan tabel pengguna sudah ada
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pengguna'
      );
    `;
    const { rows } = await client.query(checkQuery);
    
    // 2. Jika tabel sudah ada, hentikan proses (Jangan lakukan DDL & Seeding)
    if (rows[0].exists) {
      console.log('Database AEROMILES sudah ada. Skip proses seeding.');
      return;
    }

    console.log('Database AEROMILES belum ada. Memulai DDL dan Seeding...');

    // 3. Baca file seed.sql (lokasi relatif ke file ini)
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const sqlFilePath = path.join(__dirname, 'database', 'seed.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // 4. Eksekusi seluruh file SQL dalam satu transaksi
    await client.query('BEGIN'); // Mulai transaksi
    await client.query(sql);
    await client.query('COMMIT'); // Simpan perubahan
    
    console.log('DDL dan Data Seeding AEROMILES berhasil dieksekusi!');

  } catch (error) {
    await client.query('ROLLBACK'); // Batalkan semua jika ada error
    console.error('Gagal melakukan seeding database:', error);
  } finally {
    // 5. Kembalikan koneksi ke Pool
    client.release();
  }
}

export default { runSeed };
