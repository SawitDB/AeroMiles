// Contoh menggunakan PostgreSQL (library 'pg')
import { Pool } from 'pg';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME
};

let pool;

if (process.env.NODE_ENV === 'development') {
  // Singleton pattern untuk local development
  if (!global._pgPool) {
    global._pgPool = new Pool({
      ...dbConfig,
      max: 20,
    });
  }
  pool = global._pgPool;
} else {
  // Instance baru untuk production
  pool = new Pool({
    ...dbConfig,
    max: 10,
  });
}

export const query = async (text, params) => {
  return await pool.query(text, params);
};

export default pool;