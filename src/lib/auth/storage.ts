import type { Identitas, Member } from './types'

const MEMBERS_KEY = 'aeromiles.members'
const IDENTITAS_KEY = 'aeromiles.identitas'


export function loadMembers(): Member[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MEMBERS_KEY)
    if (!raw) return getDefaultMembers()
    return JSON.parse(raw) as Member[]
  } catch {
    return getDefaultMembers()
  }
}

export function saveMembers(members: Member[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
}

function getDefaultMembers(): Member[] {
  const defaults: Member[] = [
    {
      email: 'john@example.com',
      name: 'Mr. John William Doe',
      salutation: 'Mr.',
      firstName: 'John William',
      lastName: 'Doe',
      countryCode: '+62',
      mobileNumber: '81234567890',
      tanggalLahir: '1990-05-15',
      kewarganegaraan: 'Indonesia',
      role: 'member',
      nomorMember: 'M0001',
      idTier: 'Gold',
      tanggalBergabung: '2024-01-15',
      awardMiles: 32000,
      totalMiles: 45000,
    },
    {
      email: 'jane@example.com',
      name: 'Mrs. Jane Smith',
      salutation: 'Mrs.',
      firstName: 'Jane',
      lastName: 'Smith',
      countryCode: '+62',
      mobileNumber: '89876543210',
      tanggalLahir: '1988-03-22',
      kewarganegaraan: 'Indonesia',
      role: 'member',
      nomorMember: 'M0002',
      idTier: 'Silver',
      tanggalBergabung: '2024-03-10',
      awardMiles: 15000,
      totalMiles: 20000,
    },
    {
      email: 'budi@example.com',
      name: 'Mr. Budi Anto Santoso',
      salutation: 'Mr.',
      firstName: 'Budi Anto',
      lastName: 'Santoso',
      countryCode: '+62',
      mobileNumber: '81122334455',
      tanggalLahir: '1995-07-10',
      kewarganegaraan: 'Indonesia',
      role: 'member',
      nomorMember: 'M0003',
      idTier: 'Blue',
      tanggalBergabung: '2024-06-20',
      awardMiles: 3500,
      totalMiles: 5000,
    },
    {
      email: 'johnlennon@gmail.com',
      name: 'Mr. John Lennon',
      salutation: 'Mr.',
      firstName: 'John',
      lastName: 'Lennon',
      countryCode: '+44',
      mobileNumber: '7911123456',
      tanggalLahir: '1940-10-09',
      kewarganegaraan: 'United Kingdom',
      role: 'member',
      nomorMember: 'M0004',
      idTier: 'Blue',
      tanggalBergabung: '2026-04-12',
      awardMiles: 0,
      totalMiles: 0,
    },
  ]
  saveMembers(defaults)
  return defaults
}

export function getNextMemberNumber(): string {
  const members = loadMembers()
  const max = members.reduce((acc, m) => {
    const n = parseInt(m.nomorMember.replace('M', ''))
    return n > acc ? n : acc
  }, 0)
  return `M${String(max + 1).padStart(4, '0')}`
}


export function loadIdentitas(): Identitas[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(IDENTITAS_KEY)
    if (!raw) return getDefaultIdentitas()
    return JSON.parse(raw) as Identitas[]
  } catch {
    return getDefaultIdentitas()
  }
}

export function saveIdentitas(list: Identitas[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(IDENTITAS_KEY, JSON.stringify(list))
}

function getDefaultIdentitas(): Identitas[] {
  const defaults: Identitas[] = [
    {
      nomor: 'A12345678',
      emailMember: 'john@example.com',
      jenis: 'Paspor',
      negaraPenerbit: 'Indonesia',
      tanggalTerbit: '2020-01-15',
      tanggalHabis: '2030-01-15',
    },
    {
      nomor: '3275012345678901',
      emailMember: 'john@example.com',
      jenis: 'KTP',
      negaraPenerbit: 'Indonesia',
      tanggalTerbit: '2019-06-01',
      tanggalHabis: '2024-06-01',
    },
  ]
  saveIdentitas(defaults)
  return defaults
}

