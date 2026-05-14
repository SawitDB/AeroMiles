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

    // 3. Baca file sql (lokasi relatif ke file ini)
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const ddlSqlFilePath = path.join(__dirname, 'database', 'ddl.sql');
    const ddlSql = fs.readFileSync(ddlSqlFilePath, 'utf8');

    const seedSqlFilePath = path.join(__dirname, 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedSqlFilePath, 'utf8');

    const trigger1SqlFilePath = path.join(__dirname, 'database', 'TK04_Trigger_01_B_sawitDB.sql');
    const trigger1Sql = fs.readFileSync(trigger1SqlFilePath, 'utf8');

    const trigger2SqlFilePath = path.join(__dirname, 'database', 'TK04_Trigger_02_B_sawitDB.sql');
    const trigger2Sql = fs.readFileSync(trigger2SqlFilePath, 'utf8');

    const trigger3SqlFilePath = path.join(__dirname, 'database', 'TK04_Trigger_03_B_sawitDB.sql');
    const trigger3Sql = fs.readFileSync(trigger3SqlFilePath, 'utf8');

    const trigger4SqlFilePath = path.join(__dirname, 'database', 'TK04_Trigger_04_B_sawitDB.sql');
    const trigger4Sql = fs.readFileSync(trigger4SqlFilePath, 'utf8');

    const trigger5SqlFilePath = path.join(__dirname, 'database', 'TK04_Trigger_05_B_sawitDB.sql');
    const trigger5Sql = fs.readFileSync(trigger5SqlFilePath, 'utf8');

    // 4. Eksekusi seluruh file SQL dalam satu transaksi
    await client.query('BEGIN'); // Mulai transaksi
    await client.query(ddlSql);
    await client.query(seedSql);
    await client.query(trigger1Sql);
    await client.query(trigger2Sql);
    await client.query(trigger3Sql);
    await client.query(trigger4Sql);
    await client.query(trigger5Sql);
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
