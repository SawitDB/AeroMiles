import { Pool } from 'pg'

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
}

let pool: Pool

if (process.env.NODE_ENV === 'development') {
  const g = global as typeof globalThis & { _pgPool?: Pool }
  if (!g._pgPool) g._pgPool = new Pool({ ...dbConfig, max: 20 })
  pool = g._pgPool
} else {
  pool = new Pool({ ...dbConfig, max: 10 })
}

export const query = async (text: string, params?: unknown[]) => {
  return await pool.query(text, params)
}

export default pool