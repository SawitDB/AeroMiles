export interface Pengguna {
  email: string
  password: string
  salutation: string
  first_mid_name: string
  last_name: string
  country_code: string
  mobile_number: string
  tanggal_lahir: string
  kewarganegaraan: string
}

export interface Tier {
  id_tier: string
  nama: string
  minimal_frekuensi_terbang: number
  minimal_tier_miles: number
}

export interface Member {
  email: string
  nomor_member: string
  tanggal_bergabung: string
  id_tier: string
}

export interface Penyedia {
  id: number
}

export interface Maskapai {
  kode_maskapai: string
  nama_maskapai: string
  id_penyedia: number
}

export interface Staf {
  email: string
  id_staf: string
  kode_maskapai: string
}

export interface Mitra {
  email_mitra: string
  id_penyedia: number
  nama_mitra: string
  tanggal_kerja_sama: string
}

export interface Identitas {
  nomor: string
  email_member: string
  tanggal_habis: string
  tanggal_terbit: string
  negara_penerbit: string
  jenis: string
}

export interface AwardMilesPackage {
  id: string
  harga_paket: number
  jumlah_award_miles: number
}

export interface MemberAwardMilesPackage {
  id_award_miles_package: string
  email_member: string
  timestamp: string
}

export interface Bandara {
  iata_code: string
  nama: string
  kota: string
  negara: string
}

export interface ClaimMissingMiles {
  id: number
  email_member: string
  email_staf: string | null
  maskapai: string
  bandara_asal: string
  bandara_tujuan: string
  tanggal_penerbangan: string
  flight_number: string
  nomor_tiket: string
  kelas_kabin: string
  pnr: string
  status_penerimaan: string
  timestamp: string
}

export interface Transfer {
  email_member_1: string
  email_member_2: string
  timestamp: string
  jumlah: number
  catatan: string | null
}

export interface Hadiah {
  kode_hadiah: string
  nama: string
  miles: number
  deskripsi: string | null
  valid_start_date: string
  program_end: string
  id_penyedia: number
}

export interface Redeem {
  email_member: string
  kode_hadiah: string
  timestamp: string
}
