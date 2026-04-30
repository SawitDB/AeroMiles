// Contoh menggunakan PostgreSQL (library 'pg')
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',          // Ganti dengan username database Anda
  host: 'localhost',
  database: 'postgres',     // Nama database yang dibuat di langkah 1
  password: 'mengmong', // Ganti dengan password database Anda
  port: 5432,
});

module.exports = pool;