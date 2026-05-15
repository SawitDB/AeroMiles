import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;

// Bypass environment checks for JWT if running standalone
process.env.JWT_SECRET = process.env.JWT_SECRET || 'temporary_secret_for_init';


const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString,
  ssl: false,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('--- Memulai Reset & Seeding Database ---');
    
    // 1. Reset Database
    console.log('1. Mengosongkan database (Drop Schema Public)...');
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    // 2. Seeding
    const baseDir = path.join(process.cwd(), 'src', 'lib', 'database');
    const files = [
      'ddl.sql',
      'seed.sql',
      'TK04_Trigger_01_B_sawitDB.sql',
      'TK04_Trigger_02_B_sawitDB.sql',
      'TK04_Trigger_03_B_sawitDB.sql',
      'TK04_Trigger_04_B_sawitDB.sql',
      'TK04_Trigger_05_B_sawitDB.sql'
    ];

    await client.query('BEGIN');
    for (const file of files) {
      console.log(`2. Mengeksekusi ${file}...`);
      const sql = fs.readFileSync(path.join(baseDir, file), 'utf8');
      await client.query(sql);
    }
    await client.query('COMMIT');
    
    console.log('\n--- DATABASE BERHASIL DI-RESET DAN DI-SEED! ---');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\nGAGAL:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
