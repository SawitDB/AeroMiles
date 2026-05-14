--- DDL AEROMILES

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- 1. PENGGUNA
CREATE TABLE PENGGUNA (
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL, -- Wajib di hash di sisi aplikasi
    salutation VARCHAR(10) NOT NULL,
    first_mid_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    kewarganegaraan VARCHAR(50) NOT NULL
);

-- 2. TIER
CREATE TABLE TIER (
    id_tier VARCHAR(10) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    minimal_frekuensi_terbang INT NOT NULL,
    minimal_tier_miles INT NOT NULL
);

-- 3. MEMBER
CREATE SEQUENCE member_seq START 1;

CREATE TABLE MEMBER (
    email VARCHAR(100) PRIMARY KEY,
    nomor_member VARCHAR(20) DEFAULT ('M' || LPAD(nextval('member_seq')::TEXT, 4, '0')) NOT NULL UNIQUE,
    tanggal_bergabung DATE NOT NULL,
    id_tier VARCHAR(10) NOT NULL,
    award_miles INT DEFAULT 0,
    total_miles INT DEFAULT 0,
    FOREIGN KEY (email) REFERENCES PENGGUNA(email),
    FOREIGN KEY (id_tier) REFERENCES TIER(id_tier)
);

-- 4. PENYEDIA
CREATE TABLE PENYEDIA (
    id SERIAL PRIMARY KEY
);

-- 5. MASKAPAI
CREATE TABLE MASKAPAI (
    kode_maskapai VARCHAR(10) PRIMARY KEY,
    nama_maskapai VARCHAR(100) NOT NULL,
    id_penyedia INT NOT NULL,
    FOREIGN KEY (id_penyedia) REFERENCES PENYEDIA(id)
);

-- 6. STAF
CREATE SEQUENCE staf_seq START 1;

CREATE TABLE STAF (
    email VARCHAR(100) PRIMARY KEY,
    id_staf VARCHAR(20) DEFAULT ('S' || LPAD(nextval('staf_seq')::TEXT, 4, '0')) NOT NULL UNIQUE, -- Format custom S[XXXX]
    kode_maskapai VARCHAR(10) NOT NULL,
    FOREIGN KEY (email) REFERENCES PENGGUNA(email),
    FOREIGN KEY (kode_maskapai) REFERENCES MASKAPAI(kode_maskapai)
);

-- 7. MITRA
CREATE TABLE MITRA (
    email_mitra VARCHAR(100) PRIMARY KEY,
    id_penyedia INT NOT NULL UNIQUE,
    nama_mitra VARCHAR(100) NOT NULL,
    tanggal_kerja_sama DATE NOT NULL,
    FOREIGN KEY (id_penyedia) REFERENCES PENYEDIA(id) ON DELETE CASCADE
);

-- 8. IDENTITAS
CREATE TABLE IDENTITAS (
    nomor VARCHAR(50) PRIMARY KEY,
    email_member VARCHAR(100) NOT NULL,
    tanggal_habis DATE NOT NULL,
    tanggal_terbit DATE NOT NULL,
    negara_penerbit VARCHAR(50) NOT NULL,
    jenis VARCHAR(30) NOT NULL,
    FOREIGN KEY (email_member) REFERENCES MEMBER(email) ON DELETE CASCADE
);

-- 9. AWARD_MILES_PACKAGE
CREATE SEQUENCE award_miles_package_seq START 1;

CREATE TABLE AWARD_MILES_PACKAGE (
    id VARCHAR(20) DEFAULT ('AMP' || LPAD(nextval('award_miles_package_seq')::TEXT, 3, '0')) PRIMARY KEY, -- Format custom AMP-[XXX]
    harga_paket DECIMAL(15,2) NOT NULL,
    jumlah_award_miles INT NOT NULL
);

-- 10. MEMBER_AWARD_MILES_PACKAGE
CREATE TABLE MEMBER_AWARD_MILES_PACKAGE (
    id_award_miles_package VARCHAR(20) NOT NULL,
    email_member VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    PRIMARY KEY (id_award_miles_package, email_member, timestamp),
    FOREIGN KEY (id_award_miles_package) REFERENCES AWARD_MILES_PACKAGE(id),
    FOREIGN KEY (email_member) REFERENCES MEMBER(email) ON DELETE CASCADE
);

-- 11. BANDARA
CREATE TABLE BANDARA (
    iata_code CHAR(3) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kota VARCHAR(100) NOT NULL,
    negara VARCHAR(100) NOT NULL
);

-- 12. CLAIM_MISSING_MILES
CREATE TABLE CLAIM_MISSING_MILES (
    id SERIAL PRIMARY KEY,
    email_member VARCHAR(100) NOT NULL,
    email_staf VARCHAR(100), -- Null ketika belum ditangani
    maskapai VARCHAR(10) NOT NULL,
    bandara_asal VARCHAR(3) NOT NULL,
    bandara_tujuan VARCHAR(3) NOT NULL,
    tanggal_penerbangan DATE NOT NULL,
    flight_number VARCHAR(10) NOT NULL,
    nomor_tiket VARCHAR(20) NOT NULL,
    kelas_kabin VARCHAR(20) NOT NULL,
    pnr VARCHAR(10) NOT NULL,
    status_penerimaan VARCHAR(20) NOT NULL DEFAULT 'Menunggu',
    timestamp TIMESTAMP NOT NULL,
    -- Constraint untuk mencegah pengajuan klaim duplikat
    UNIQUE (email_member, flight_number, tanggal_penerbangan, nomor_tiket),
    FOREIGN KEY (email_member) REFERENCES MEMBER(email) ON DELETE CASCADE,
    FOREIGN KEY (email_staf) REFERENCES STAF(email),
    FOREIGN KEY (maskapai) REFERENCES MASKAPAI(kode_maskapai),
    FOREIGN KEY (bandara_asal) REFERENCES BANDARA(iata_code),
    FOREIGN KEY (bandara_tujuan) REFERENCES BANDARA(iata_code)
);

-- 13. TRANSFER
CREATE TABLE TRANSFER (
    email_member_1 VARCHAR(100) NOT NULL,
    email_member_2 VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    jumlah INT NOT NULL,
    catatan VARCHAR(255),
    PRIMARY KEY (email_member_1, email_member_2, timestamp),
    -- Mencegah transfer miles ke dirinya sendiri
    CHECK (email_member_1 <> email_member_2),
    FOREIGN KEY (email_member_1) REFERENCES MEMBER(email) ON DELETE CASCADE,
    FOREIGN KEY (email_member_2) REFERENCES MEMBER(email) ON DELETE CASCADE
);

-- 14. HADIAH
CREATE SEQUENCE hadiah_seq START 1;

CREATE TABLE HADIAH (
    kode_hadiah VARCHAR(20) DEFAULT ('RWD' || LPAD(nextval('hadiah_seq')::TEXT, 3, '0')) PRIMARY KEY, -- Format custom RWD-[XXX]
    nama VARCHAR(100) NOT NULL,
    miles INT NOT NULL,
    deskripsi TEXT,
    valid_start_date DATE NOT NULL,
    program_end DATE NOT NULL,
    id_penyedia INT NOT NULL,
    FOREIGN KEY (id_penyedia) REFERENCES PENYEDIA(id) ON DELETE CASCADE
);

-- 15. REDEEM
CREATE TABLE REDEEM (
    email_member VARCHAR(100) NOT NULL,
    kode_hadiah VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    PRIMARY KEY (email_member, kode_hadiah, timestamp),
    FOREIGN KEY (email_member) REFERENCES MEMBER(email) ON DELETE CASCADE,
    FOREIGN KEY (kode_hadiah) REFERENCES HADIAH(kode_hadiah)
);