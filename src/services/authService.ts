import pool, { query } from '@/lib/db'
import type { User, UserRole } from '@/lib/auth/types'

type DbUserRow = {
  email: string
  password: string
  salutation: string
  first_mid_name: string
  last_name: string
  country_code: string
  mobile_number: string
  tanggal_lahir: Date | string
  kewarganegaraan: string
  role: UserRole | null
  nomor_member: string | null
  id_tier: string | null
  tanggal_bergabung: Date | string | null
  id_staf: string | null
  kode_maskapai: string | null
}

export type AuthenticatedUser = {
  user: User
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  salutation: string
  firstMidName: string
  lastName: string
  countryCode: string
  mobileNumber: string
  tanggalLahir: string
  kewarganegaraan: string
  role: UserRole
  kodeMaskapai?: string
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return value.toISOString().slice(0, 10)
}

function mapRowToUser(row: DbUserRow): User {
  const role = row.role ?? (row.nomor_member ? 'member' : 'staf')
  const name = [row.salutation, row.first_mid_name, row.last_name].filter(Boolean).join(' ')

  return {
    email: row.email,
    name,
    salutation: row.salutation,
    firstName: row.first_mid_name,
    lastName: row.last_name,
    countryCode: row.country_code,
    mobileNumber: row.mobile_number,
    tanggalLahir: formatDate(row.tanggal_lahir),
    kewarganegaraan: row.kewarganegaraan,
    role,
    nomorMember: row.nomor_member ?? undefined,
    idTier: row.id_tier ?? undefined,
    tanggalBergabung: formatDate(row.tanggal_bergabung) || undefined,
    idStaf: row.id_staf ?? undefined,
    kodeMaskapai: row.kode_maskapai ?? undefined,
  }
}

export async function getAuthenticatedUserByEmail(email: string): Promise<AuthenticatedUser | null> {
  const normalizedEmail = email.trim().toLowerCase()
  const result = await query(
    `
      SELECT
        p.email,
        p.password,
        p.salutation,
        p.first_mid_name,
        p.last_name,
        p.country_code,
        p.mobile_number,
        p.tanggal_lahir,
        p.kewarganegaraan,
        CASE WHEN m.email IS NOT NULL THEN 'member' WHEN s.email IS NOT NULL THEN 'staf' ELSE NULL END AS role,
        m.nomor_member,
        m.id_tier,
        m.tanggal_bergabung,
        s.id_staf,
        s.kode_maskapai
      FROM pengguna p
      LEFT JOIN member m ON m.email = p.email
      LEFT JOIN staf s ON s.email = p.email
      WHERE lower(p.email) = lower($1)
      LIMIT 1
    `,
    [normalizedEmail],
  )

  const row = result.rows[0] as DbUserRow | undefined
  if (!row) return null

  return {
    user: mapRowToUser(row),
    password: row.password,
  }
}

export async function loginUser(email: string, password: string): Promise<User> {
  const authUser = await getAuthenticatedUserByEmail(email)

  if (!authUser) {
    throw new Error('Email tidak ditemukan')
  }

  if (authUser.password !== password) {
    throw new Error('Password salah')
  }

  return authUser.user
}

export async function getPublicUserByEmail(email: string): Promise<User | null> {
  const authUser = await getAuthenticatedUserByEmail(email)
  return authUser ? authUser.user : null
}

export async function createRegisteredUser(input: RegisterInput): Promise<User> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const insertUser = await client.query(
      `
        INSERT INTO pengguna (
          email,
          password,
          salutation,
          first_mid_name,
          last_name,
          country_code,
          mobile_number,
          tanggal_lahir,
          kewarganegaraan
        )
        VALUES ($1, crypt($2, gen_salt('bf', 10)), $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        normalizedEmail,
        input.password,
        input.salutation,
        input.firstMidName,
        input.lastName,
        input.countryCode,
        input.mobileNumber,
        input.tanggalLahir,
        input.kewarganegaraan,
      ],
    )

    if (insertUser.rowCount !== 1) {
      throw new Error('Gagal membuat pengguna')
    }

    if (input.role === 'staf') {
      if (!input.kodeMaskapai) {
        throw new Error('Kode maskapai wajib diisi untuk staf')
      }

      const maskapai = await client.query('SELECT 1 FROM maskapai WHERE kode_maskapai = $1 LIMIT 1', [input.kodeMaskapai])
      if (!maskapai.rowCount) {
        throw new Error('Kode maskapai tidak valid')
      }

      await client.query('INSERT INTO staf (email, kode_maskapai) VALUES ($1, $2)', [normalizedEmail, input.kodeMaskapai])
    } else {
      await client.query("INSERT INTO member (email, tanggal_bergabung, id_tier) VALUES ($1, CURRENT_DATE, 'BLUE')", [normalizedEmail])
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  const createdUser = await getPublicUserByEmail(normalizedEmail)
  if (!createdUser) {
    throw new Error('Pengguna baru gagal dibaca setelah registrasi')
  }

  return createdUser
}