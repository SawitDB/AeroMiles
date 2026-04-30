/**
 * Seed all mock data to localStorage on app init
 * Call this once on app startup
 */

export function seedAllData() {
  // Seed aeromiles_tier
  if (!localStorage.getItem("aeromiles_tier")) {
    const tiers = [
      {
        id_tier: "BLUE",
        nama: "Blue",
        minimal_frekuensi_terbang: 0,
        minimal_tier_miles: 0,
      },
      {
        id_tier: "SILVER",
        nama: "Silver",
        minimal_frekuensi_terbang: 10,
        minimal_tier_miles: 10000,
      },
      {
        id_tier: "GOLD",
        nama: "Gold",
        minimal_frekuensi_terbang: 25,
        minimal_tier_miles: 30000,
      },
      {
        id_tier: "PLATINUM",
        nama: "Platinum",
        minimal_frekuensi_terbang: 50,
        minimal_tier_miles: 75000,
      },
    ];
    localStorage.setItem("aeromiles_tier", JSON.stringify(tiers));
  }

  // Seed aeromiles_amp (Award Miles Package)
  if (!localStorage.getItem("aeromiles_amp")) {
    const packages = [
      { id: "AMP-001", jumlah_award_miles: 1000, harga_paket: 150000 },
      { id: "AMP-002", jumlah_award_miles: 2500, harga_paket: 350000 },
      { id: "AMP-003", jumlah_award_miles: 5000, harga_paket: 650000 },
      { id: "AMP-004", jumlah_award_miles: 10000, harga_paket: 1200000 },
      { id: "AMP-005", jumlah_award_miles: 25000, harga_paket: 2750000 },
    ];
    localStorage.setItem("aeromiles_amp", JSON.stringify(packages));
  }

  // Seed aeromiles_hadiah (Gifts/Rewards)
  if (!localStorage.getItem("aeromiles_hadiah")) {
    const hadiah = [
      {
        kode_hadiah: "RWD-001",
        nama: "Flight Upgrade Premium",
        miles: 5000,
        deskripsi:
          "Upgrade ke premium economy untuk penerbangan domestik atau internasional.",
        valid_start_date: "2026-01-01",
        program_end: "2026-12-31",
        id_penyedia: "PENYEDIA-001",
        nama_penyedia: "PT Garuda Indonesia",
      },
      {
        kode_hadiah: "RWD-002",
        nama: "Free Baggage Allowance",
        miles: 2000,
        deskripsi: "Tambahan bagasi gratis hingga 10kg untuk setiap penerbangan.",
        valid_start_date: "2026-02-01",
        program_end: "2026-12-31",
        id_penyedia: "PENYEDIA-001",
        nama_penyedia: "PT Garuda Indonesia",
      },
      {
        kode_hadiah: "RWD-003",
        nama: "Hotel Voucher 1 Malam",
        miles: 8000,
        deskripsi: "Voucher hotel bintang 4 untuk 1 malam menginap.",
        valid_start_date: "2026-03-01",
        program_end: "2026-12-31",
        id_penyedia: "PENYEDIA-002",
        nama_penyedia: "Hotel Booking Partner",
      },
      {
        kode_hadiah: "RWD-004",
        nama: "Lounge Access 3 Kali",
        miles: 3000,
        deskripsi: "Akses eksklusif ke premium lounge bandara selama 3 kali kunjungan.",
        valid_start_date: "2026-04-01",
        program_end: "2026-12-31",
        id_penyedia: "PENYEDIA-003",
        nama_penyedia: "Airport Lounge Network",
      },
      {
        kode_hadiah: "RWD-005",
        nama: "Travel Insurance Tahunan",
        miles: 6000,
        deskripsi: "Asuransi perjalanan komprehensif untuk seluruh tahun.",
        valid_start_date: "2026-05-01",
        program_end: "2026-12-31",
        id_penyedia: "PENYEDIA-004",
        nama_penyedia: "Insurance Partner",
      },
    ];
    localStorage.setItem("aeromiles_hadiah", JSON.stringify(hadiah));
  }

  // Seed aeromiles_member_amp (purchase history - starts empty)
  if (!localStorage.getItem("aeromiles_member_amp")) {
    localStorage.setItem("aeromiles_member_amp", JSON.stringify([]));
  }

  // Seed aeromiles_redeem (redeem history - starts empty)
  if (!localStorage.getItem("aeromiles_redeem")) {
    localStorage.setItem("aeromiles_redeem", JSON.stringify([]));
  }

  // Seed aeromiles_transfer (transfer history)
  if (!localStorage.getItem("aeromiles_transfer")) {
    const transfers = [
      {
        email_member_1: "member@aeromiles.com",
        email_member_2: "other@aeromiles.com",
        timestamp: "2026-04-28T09:15:00Z",
        jumlah: 1000,
        catatan: "Hadiah ulang tahun",
      },
    ];
    localStorage.setItem("aeromiles_transfer", JSON.stringify(transfers));
  }

  // Seed aeromiles_claim (claim history)
  if (!localStorage.getItem("aeromiles_claim")) {
    const claims = [
      {
        id: 1,
        email_member: "member@aeromiles.com",
        maskapai: "GA",
        bandara_asal: "CGK",
        bandara_tujuan: "DPS",
        tanggal_penerbangan: "2026-04-10",
        flight_number: "GA402",
        nomor_tiket: "1262345678901",
        kelas_kabin: "Economy",
        pnr: "ABCDEF",
        status_penerimaan: "Disetujui",
        timestamp: "2026-04-15T10:00:00Z",
        email_staf: "staf@aeromiles.com",
      },
      {
        id: 2,
        email_member: "member@aeromiles.com",
        maskapai: "SQ",
        bandara_asal: "SIN",
        bandara_tujuan: "LHR",
        tanggal_penerbangan: "2026-04-20",
        flight_number: "SQ308",
        nomor_tiket: "6182345678902",
        kelas_kabin: "Business",
        pnr: "GHIJKL",
        status_penerimaan: "Menunggu",
        timestamp: "2026-04-25T14:30:00Z",
        email_staf: "staf@aeromiles.com",
      },
    ];
    localStorage.setItem("aeromiles_claim", JSON.stringify(claims));
  }

  // Empty placeholders
  if (!localStorage.getItem("aeromiles_member_amp")) localStorage.setItem("aeromiles_member_amp", JSON.stringify([]));
  if (!localStorage.getItem("aeromiles_redeem")) localStorage.setItem("aeromiles_redeem", JSON.stringify([]));
}
