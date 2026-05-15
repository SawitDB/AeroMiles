import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL?.includes('localhost') || !process.env.DATABASE_URL || process.env.NODE_ENV === 'development'
    ? false
    : {
        rejectUnauthorized: false,
      },
})

export const query = async (text: string, params?: unknown[]) => {
  return await pool.query(text, params)
}

export default pool