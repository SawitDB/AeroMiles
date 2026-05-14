export type UserRole = 'member' | 'staf'

export type User = {
  email: string
  name: string
  salutation: string
  firstName: string
  lastName: string
  countryCode: string
  mobileNumber: string
  tanggalLahir: string
  kewarganegaraan: string
  role: UserRole
  // Member only
  nomorMember?: string
  idTier?: string
  tanggalBergabung?: string
  awardMiles?: number
  totalMiles?: number
  // Staf only
  idStaf?: string
  kodeMaskapai?: string
}

export type AuthState = {
  user: User | null
}

export type Identitas = {
  nomor: string
  emailMember: string
  jenis: 'Paspor' | 'KTP' | 'SIM'
  negaraPenerbit: string
  tanggalTerbit: string
  tanggalHabis: string
}

export type Member = User & {
  role: 'member'
  nomorMember: string
  idTier: string
  tanggalBergabung: string
  awardMiles: number
  totalMiles: number
}