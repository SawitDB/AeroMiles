CREATE EXTENSION IF NOT EXISTS pgcrypto;

--- DATA SEEDING AEROMILES

-- 2. TIER (4 Data) - Dieksekusi duluan karena Member butuh Foreign Key ini
INSERT INTO TIER (id_tier, nama, minimal_frekuensi_terbang, minimal_tier_miles) VALUES
('BLUE', 'Blue Tier', 0, 0),
('SILV', 'Silver Tier', 10, 10000),
('GOLD', 'Gold Tier', 30, 30000),
('PLAT', 'Platinum Tier', 50, 50000);

-- 1. PENGGUNA (60 Data) 
-- 50 pertama untuk Member, 10 terakhir untuk Staf
INSERT INTO PENGGUNA (email, password, salutation, first_mid_name, last_name, country_code, mobile_number, tanggal_lahir, kewarganegaraan) VALUES
('andi.pratama@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Andi', 'Pratama', '+62', '8120000001', '1990-01-15', 'Indonesia'),
('budi.santoso@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Budi', 'Santoso', '+62', '8120000002', '1988-03-22', 'Indonesia'),
('citra.kirana@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Citra', 'Kirana', '+62', '8120000003', '1995-07-10', 'Indonesia'),
('dewi.lestari@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Dewi', 'Lestari', '+62', '8120000004', '1992-11-05', 'Indonesia'),
('eka.putra@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Eka', 'Putra', '+62', '8120000005', '1985-04-18', 'Indonesia'),
('fajar.nugroho@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Fajar', 'Nugroho', '+62', '8120000006', '1991-09-30', 'Indonesia'),
('gita.gutawa@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Gita', 'Gutawa', '+62', '8120000007', '1993-08-11', 'Indonesia'),
('hadi.wijaya@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Hadi', 'Wijaya', '+62', '8120000008', '1987-12-25', 'Indonesia'),
('intan.permata@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Intan', 'Permata', '+62', '8120000009', '1996-02-14', 'Indonesia'),
('joko.widodo@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Joko', 'Widodo', '+62', '8120000010', '1961-06-21', 'Indonesia'),
('kartika.sari@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Kartika', 'Sari', '+62', '8120000011', '1994-05-05', 'Indonesia'),
('lukman.hakim@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Lukman', 'Hakim', '+62', '8120000012', '1989-10-12', 'Indonesia'),
('maya.rumantir@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Maya', 'Rumantir', '+62', '8120000013', '1990-12-01', 'Indonesia'),
('nur.hidayat@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Nur', 'Hidayat', '+62', '8120000014', '1986-07-07', 'Indonesia'),
('oscar.lawalata@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Oscar', 'Lawalata', '+62', '8120000015', '1997-03-03', 'Indonesia'),
('putri.marino@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Putri', 'Marino', '+62', '8120000016', '1993-08-04', 'Indonesia'),
('qori.sandioriva@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Qori', 'Sandioriva', '+62', '8120000017', '1991-08-17', 'Indonesia'),
('reza.rahadian@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Reza', 'Rahadian', '+62', '8120000018', '1987-03-05', 'Indonesia'),
('sari.wangi@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Sari', 'Wangi', '+62', '8120000019', '1995-11-20', 'Indonesia'),
('tari.lestar@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Tari', 'Lestari', '+62', '8120000020', '1992-04-10', 'Indonesia'),
('umar.bakri@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Umar', 'Bakri', '+62', '8120000021', '1980-05-02', 'Indonesia'),
('vina.panduwinata@email.com',crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Vina', 'Panduwinata', '+62', '8120000022', '1985-09-09', 'Indonesia'),
('wira.saksana@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Wira', 'Saksana', '+62', '8120000023', '1998-01-20', 'Indonesia'),
('xena.anggita@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Xena', 'Anggita', '+62', '8120000024', '1999-10-31', 'Indonesia'),
('yudi.tomo@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Yudi', 'Tomo', '+62', '8120000025', '1994-06-15', 'Indonesia'),
('zainudin.mz@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Zainudin', 'MZ', '+62', '8120000026', '1982-02-28', 'Indonesia'),
('arif.hidayat@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Arif', 'Hidayat', '+62', '8120000027', '1990-11-11', 'Indonesia'),
('bella.saphira@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Bella', 'Saphira', '+62', '8120000028', '1993-12-12', 'Indonesia'),
('chandra.liow@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Chandra', 'Liow', '+62', '8120000029', '1995-01-01', 'Indonesia'),
('dina.mariana@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Dina', 'Mariana', '+62', '8120000030', '1996-02-02', 'Indonesia'),
('edi.santoso@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Edi', 'Santoso', '+62', '8120000031', '1988-03-03', 'Indonesia'),
('fitri.tropica@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Fitri', 'Tropica', '+62', '8120000032', '1989-04-04', 'Indonesia'),
('gilang.dirga@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Gilang', 'Dirga', '+62', '8120000033', '1991-05-05', 'Indonesia'),
('hani.handayani@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Hani', 'Handayani', '+62', '8120000034', '1992-06-06', 'Indonesia'),
('ilham.smash@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Ilham', 'Fauzi', '+62', '8120000035', '1994-07-07', 'Indonesia'),
('jihan.fahira@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Jihan', 'Fahira', '+62', '8120000036', '1995-08-08', 'Indonesia'),
('kevin.julio@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Kevin', 'Julio', '+62', '8120000037', '1996-09-09', 'Indonesia'),
('laila.sari@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Laila', 'Sari', '+62', '8120000038', '1997-10-10', 'Indonesia'),
('mamat.alkatiri@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Mamat', 'Alkatiri', '+62', '8120000039', '1998-11-11', 'Indonesia'),
('nisa.sabyan@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Nisa', 'Sabyan', '+62', '8120000040', '1999-12-12', 'Indonesia'),
('oki.setiana@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Oki', 'Setiana', '+62', '8120000041', '1985-01-15', 'Indonesia'),
('rina.nose@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Rina', 'Nose', '+62', '8120000042', '1986-02-16', 'Indonesia'),
('surya.saputra@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Surya', 'Saputra', '+62', '8120000043', '1987-03-17', 'Indonesia'),
('tika.panggabean@email.com',crypt('nyawit', gen_salt('bf', 10)),'Ms.', 'Tika', 'Panggabean', '+62','8120000044', '1988-04-18', 'Indonesia'),
('ujang.bustomi@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Ujang', 'Bustomi', '+62', '8120000045', '1989-05-19', 'Indonesia'),
('vivi.zubedi@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Vivi', 'Zubedi', '+62', '8120000046', '1990-06-20', 'Indonesia'),
('wahyu.kadeo@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Wahyu', 'Kadeo', '+62', '8120000047', '1991-07-21', 'Indonesia'),
('yuni.shara@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Yuni', 'Shara', '+62', '8120000048', '1992-08-22', 'Indonesia'),
('zaki.dermawan@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Zaki', 'Dermawan', '+62', '8120000049', '1993-09-23', 'Indonesia'),
('ari.lasso@email.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Ari', 'Lasso', '+62', '8120000050', '1994-10-24', 'Indonesia'),
-- 10 Staf Maskapai
('agus.staf@garuda.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Agus', 'Firmansyah', '+62', '8110000001', '1985-01-10', 'Indonesia'),
('bambang.staf@citilink.com',crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Bambang', 'Pamungkas', '+62', '8110000002', '1986-02-11', 'Indonesia'),
('cici.staf@lion.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Cici', 'Paramida', '+62', '8110000003', '1987-03-12', 'Indonesia'),
('dedi.staf@batik.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Dedi', 'Corbuzier', '+62', '8110000004', '1988-04-13', 'Indonesia'),
('evi.staf@airasia.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Evi', 'Masamba', '+62', '8110000005', '1989-05-14', 'Indonesia'),
('feri.staf@garuda.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Feri', 'Irawan', '+62', '8110000006', '1990-06-15', 'Indonesia'),
('gina.staf@citilink.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Gina', 'Youbi', '+62', '8110000007', '1991-07-16', 'Indonesia'),
('hendra.staf@lion.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Hendra', 'Setiawan', '+62', '8110000008', '1992-08-17', 'Indonesia'),
('ira.staf@batik.com', crypt('nyawit', gen_salt('bf', 10)), 'Ms.', 'Ira', 'Wibowo', '+62', '8110000009', '1993-09-18', 'Indonesia'),
('jaka.staf@airasia.com', crypt('nyawit', gen_salt('bf', 10)), 'Mr.', 'Jaka', 'Tingkir', '+62', '8110000010', '1994-10-19', 'Indonesia');

-- 3. MEMBER (50 Data)
-- award_miles & total_miles mencerminkan paket yang sudah dibeli (lihat MEMBER_AWARD_MILES_PACKAGE)
-- Members without packages receive 1000 starter award_miles
INSERT INTO MEMBER (email, tanggal_bergabung, id_tier, award_miles, total_miles) VALUES
('andi.pratama@email.com', '2023-01-10', 'BLUE', 1000, 10000),
('budi.santoso@email.com', '2023-01-15', 'SILV', 2500, 35000),
('citra.kirana@email.com', '2023-02-20', 'GOLD', 5500, 55000),
('dewi.lestari@email.com', '2023-03-05', 'PLAT', 12000, 120000),
('eka.putra@email.com', '2023-04-10', 'BLUE', 35000, 35000),
('fajar.nugroho@email.com', '2023-05-12', 'SILV', 1000, 12000),
('gita.gutawa@email.com', '2023-06-18', 'GOLD', 2500, 28000),
('hadi.wijaya@email.com', '2023-07-22', 'PLAT', 5500, 30000),
('intan.permata@email.com', '2023-08-08', 'BLUE', 12000, 12000),
('joko.widodo@email.com', '2023-09-09', 'SILV', 35000, 50000),
('kartika.sari@email.com', '2023-10-10', 'GOLD', 1000, 30000),
('lukman.hakim@email.com', '2023-11-11', 'PLAT', 2500, 50000),
('maya.rumantir@email.com', '2023-12-12', 'BLUE', 5500, 5500),
('nur.hidayat@email.com', '2024-01-01', 'SILV', 12000, 15000),
('oscar.lawalata@email.com', '2024-02-02', 'GOLD', 35000, 45000),
('putri.marino@email.com', '2024-03-03', 'PLAT', 1000, 60000),
('qori.sandioriva@email.com', '2024-04-04', 'BLUE', 2500, 2500),
('reza.rahadian@email.com', '2024-05-05', 'SILV', 5500, 8000),
('sari.wangi@email.com', '2024-06-06', 'GOLD', 12000, 30000),
('tari.lestar@email.com', '2024-07-07', 'PLAT', 35000, 70000),
('umar.bakri@email.com', '2024-08-08', 'BLUE', 1000, 1000),
('vina.panduwinata@email.com','2024-09-09', 'SILV', 1000, 15000),
('wira.saksana@email.com', '2024-10-10', 'GOLD', 1000, 30000),
('xena.anggita@email.com', '2024-11-11', 'PLAT', 1000, 50000),
('yudi.tomo@email.com', '2024-12-12', 'BLUE', 1000, 2000),
('zainudin.mz@email.com', '2025-01-01', 'SILV', 1000, 12000),
('arif.hidayat@email.com', '2025-01-05', 'GOLD', 1000, 40000),
('bella.saphira@email.com', '2025-01-10', 'PLAT', 1000, 60000),
('chandra.liow@email.com', '2025-01-15', 'BLUE', 1000, 2500),
('dina.mariana@email.com', '2025-01-20', 'SILV', 1000, 10000),
('edi.santoso@email.com', '2025-01-25', 'GOLD', 1000, 35000),
('fitri.tropica@email.com', '2025-02-01', 'PLAT', 1000, 50000),
('gilang.dirga@email.com', '2025-02-05', 'BLUE', 1000, 3000),
('hani.handayani@email.com', '2025-02-10', 'SILV', 1000, 8000),
('ilham.smash@email.com', '2025-02-15', 'GOLD', 1000, 25000),
('jihan.fahira@email.com', '2025-02-20', 'PLAT', 1000, 55000),
('kevin.julio@email.com', '2025-02-25', 'BLUE', 1000, 5000),
('laila.sari@email.com', '2025-03-01', 'SILV', 1000, 14000),
('mamat.alkatiri@email.com', '2025-03-05', 'GOLD', 1000, 32000),
('nisa.sabyan@email.com', '2025-03-10', 'PLAT', 1000, 45000),
('oki.setiana@email.com', '2025-03-15', 'BLUE', 1000, 2000),
('rina.nose@email.com', '2025-03-20', 'SILV', 1000, 12000),
('surya.saputra@email.com', '2025-03-25', 'GOLD', 1000, 28000),
('tika.panggabean@email.com','2025-04-01', 'PLAT', 1000, 48000),
('ujang.bustomi@email.com', '2025-04-05', 'BLUE', 1000, 1000),
('vivi.zubedi@email.com', '2025-04-10', 'SILV', 1000, 6000),
('wahyu.kadeo@email.com', '2025-04-15', 'GOLD', 1000, 10000),
('yuni.shara@email.com', '2025-04-20', 'PLAT', 1000, 42000),
('zaki.dermawan@email.com', '2025-04-25', 'BLUE', 1000, 3000),
('ari.lasso@email.com', '2025-05-01', 'SILV', 1000, 12000);

-- 4. PENYEDIA (8 Data)
-- Karena auto-increment SERIAL, kita panggil nilai default 8 kali (menghasilkan ID 1-8)
INSERT INTO PENYEDIA (id) VALUES 
(DEFAULT), (DEFAULT), (DEFAULT), (DEFAULT), 
(DEFAULT), (DEFAULT), (DEFAULT), (DEFAULT);

-- 5. MASKAPAI (5 Data)
-- Diasosiasikan dengan Penyedia ID 1 sampai 3
INSERT INTO MASKAPAI (kode_maskapai, nama_maskapai, id_penyedia) VALUES
('GA', 'Garuda Indonesia', 1),
('QG', 'Citilink Indonesia', 1),
('JT', 'Lion Air', 2),
('ID', 'Batik Air', 2),
('AK', 'AirAsia Indonesia', 3);

-- 6. STAF (10 Data)
-- Memasukkan 10 email staf ke maskapai terkait
INSERT INTO STAF (email, kode_maskapai) VALUES
('agus.staf@garuda.com', 'GA'),
('bambang.staf@citilink.com', 'QG'),
('cici.staf@lion.com', 'JT'),
('dedi.staf@batik.com', 'ID'),
('evi.staf@airasia.com', 'AK'),
('feri.staf@garuda.com', 'GA'),
('gina.staf@citilink.com', 'QG'),
('hendra.staf@lion.com', 'JT'),
('ira.staf@batik.com', 'ID'),
('jaka.staf@airasia.com', 'AK');

-- 7. MITRA (5 Data)
-- Diasosiasikan dengan Penyedia ID 4 sampai 8
INSERT INTO MITRA (email_mitra, id_penyedia, nama_mitra, tanggal_kerja_sama) VALUES
('partnership@bca.co.id', 4, 'Bank BCA', '2020-01-10'),
('corp@mandiri.co.id', 5, 'Bank Mandiri', '2020-05-20'),
('promo@traveloka.com', 6, 'Traveloka', '2021-03-15'),
('marketing@tiket.com', 7, 'Tiket.com', '2021-08-08'),
('loyalty@hyatt.com', 8, 'Hyatt Hotels', '2022-11-11');

-- 8. IDENTITAS (30 Data)
INSERT INTO IDENTITAS (nomor, email_member, tanggal_habis, tanggal_terbit, negara_penerbit, jenis) VALUES
('3171010101900001', 'andi.pratama@email.com', '2099-12-31', '2015-01-01', 'Indonesia', 'KTP'),
('A1234567', 'budi.santoso@email.com', '2028-03-22', '2023-03-22', 'Indonesia', 'Paspor'),
('3171020202950002', 'citra.kirana@email.com', '2099-12-31', '2016-02-02', 'Indonesia', 'KTP'),
('B9876543', 'dewi.lestari@email.com', '2027-11-05', '2022-11-05', 'Indonesia', 'Paspor'),
('3171030303850003', 'eka.putra@email.com', '2099-12-31', '2017-03-03', 'Indonesia', 'KTP'),
('C5556667', 'fajar.nugroho@email.com', '2030-09-30', '2020-09-30', 'Indonesia', 'Paspor'),
('3171040404930004', 'gita.gutawa@email.com', '2099-12-31', '2018-04-04', 'Indonesia', 'KTP'),
('D1112223', 'hadi.wijaya@email.com', '2029-12-25', '2019-12-25', 'Indonesia', 'Paspor'),
('3171050505960005', 'intan.permata@email.com', '2099-12-31', '2019-05-05', 'Indonesia', 'KTP'),
('E4449990', 'joko.widodo@email.com', '2031-06-21', '2021-06-21', 'Indonesia', 'Paspor'),
('3171060606940006', 'kartika.sari@email.com', '2099-12-31', '2020-06-06', 'Indonesia', 'KTP'),
('F7778881', 'lukman.hakim@email.com', '2032-10-12', '2022-10-12', 'Indonesia', 'Paspor'),
('3171070707900007', 'maya.rumantir@email.com', '2099-12-31', '2021-07-07', 'Indonesia', 'KTP'),
('G2223334', 'nur.hidayat@email.com', '2028-07-07', '2018-07-07', 'Indonesia', 'Paspor'),
('3171080808970008', 'oscar.lawalata@email.com', '2099-12-31', '2022-08-08', 'Indonesia', 'KTP'),
('H6665554', 'putri.marino@email.com', '2029-08-04', '2019-08-04', 'Indonesia', 'Paspor'),
('3171090909910009', 'qori.sandioriva@email.com', '2099-12-31', '2023-09-09', 'Indonesia', 'KTP'),
('I8881112', 'reza.rahadian@email.com', '2030-03-05', '2020-03-05', 'Indonesia', 'Paspor'),
('3171101010950010', 'sari.wangi@email.com', '2099-12-31', '2024-10-10', 'Indonesia', 'KTP'),
('J9990001', 'tari.lestar@email.com', '2031-04-10', '2021-04-10', 'Indonesia', 'Paspor'),
('3171111111800011', 'umar.bakri@email.com', '2099-12-31', '2015-11-11', 'Indonesia', 'KTP'),
('K2224445', 'vina.panduwinata@email.com', '2032-09-09', '2022-09-09', 'Indonesia', 'Paspor'),
('3171121212980012', 'wira.saksana@email.com', '2099-12-31', '2016-12-12', 'Indonesia', 'KTP'),
('L5553332', 'xena.anggita@email.com', '2028-10-31', '2018-10-31', 'Indonesia', 'Paspor'),
('3171131313940013', 'yudi.tomo@email.com', '2099-12-31', '2017-01-13', 'Indonesia', 'KTP'),
('M7771110', 'zainudin.mz@email.com', '2029-02-28', '2019-02-28', 'Indonesia', 'Paspor'),
('3171141414900014', 'arif.hidayat@email.com', '2099-12-31', '2018-02-14', 'Indonesia', 'KTP'),
('N8882229', 'bella.saphira@email.com', '2030-12-12', '2020-12-12', 'Indonesia', 'Paspor'),
('3171151515950015', 'chandra.liow@email.com', '2099-12-31', '2019-03-15', 'Indonesia', 'KTP'),
('O9993338', 'dina.mariana@email.com', '2031-02-02', '2021-02-02', 'Indonesia', 'Paspor');

-- 9. AWARD_MILES_PACKAGE (5 Data)
-- Kolom ID otomatis menjadi AMP001, AMP002, dst berkat sequence
INSERT INTO AWARD_MILES_PACKAGE (harga_paket, jumlah_award_miles) VALUES
(250000.00, 1000),
(500000.00, 2500),
(1000000.00, 5500),
(2000000.00, 12000),
(5000000.00, 35000);

-- 10. MEMBER_AWARD_MILES_PACKAGE (20 Data)
INSERT INTO MEMBER_AWARD_MILES_PACKAGE (id_award_miles_package, email_member, timestamp) VALUES
('AMP001', 'andi.pratama@email.com', '2025-10-01 10:00:00'),
('AMP002', 'budi.santoso@email.com', '2025-10-02 11:30:00'),
('AMP003', 'citra.kirana@email.com', '2025-10-03 14:15:00'),
('AMP004', 'dewi.lestari@email.com', '2025-10-04 09:45:00'),
('AMP005', 'eka.putra@email.com', '2025-10-05 16:20:00'),
('AMP001', 'fajar.nugroho@email.com', '2025-10-06 12:00:00'),
('AMP002', 'gita.gutawa@email.com', '2025-10-07 08:30:00'),
('AMP003', 'hadi.wijaya@email.com', '2025-10-08 13:10:00'),
('AMP004', 'intan.permata@email.com', '2025-10-09 15:55:00'),
('AMP005', 'joko.widodo@email.com', '2025-10-10 18:40:00'),
('AMP001', 'kartika.sari@email.com', '2025-10-11 07:25:00'),
('AMP002', 'lukman.hakim@email.com', '2025-10-12 11:05:00'),
('AMP003', 'maya.rumantir@email.com', '2025-10-13 14:50:00'),
('AMP004', 'nur.hidayat@email.com', '2025-10-14 09:15:00'),
('AMP005', 'oscar.lawalata@email.com', '2025-10-15 16:35:00'),
('AMP001', 'putri.marino@email.com', '2025-10-16 12:20:00'),
('AMP002', 'qori.sandioriva@email.com', '2025-10-17 08:05:00'),
('AMP003', 'reza.rahadian@email.com', '2025-10-18 13:40:00'),
('AMP004', 'sari.wangi@email.com', '2025-10-19 15:25:00'),
('AMP005', 'tari.lestar@email.com', '2025-10-20 18:10:00');

-- 11. BANDARA (15 Data)
INSERT INTO BANDARA (iata_code, nama, kota, negara) VALUES
('CGK', 'Soekarno-Hatta International Airport', 'Jakarta', 'Indonesia'),
('DPS', 'Ngurah Rai International Airport', 'Bali', 'Indonesia'),
('SUB', 'Juanda International Airport', 'Surabaya', 'Indonesia'),
('KNO', 'Kualanamu International Airport', 'Medan', 'Indonesia'),
('UPG', 'Sultan Hasanuddin International Airport', 'Makassar', 'Indonesia'),
('YIA', 'Yogyakarta International Airport', 'Yogyakarta', 'Indonesia'),
('BPN', 'Sepinggan International Airport', 'Balikpapan', 'Indonesia'),
('BTH', 'Hang Nadim International Airport', 'Batam', 'Indonesia'),
('PLM', 'Sultan Mahmud Badaruddin II International Airport', 'Palembang', 'Indonesia'),
('SRG', 'Ahmad Yani International Airport', 'Semarang', 'Indonesia'),
('PKU', 'Sultan Syarif Kasim II International Airport', 'Pekanbaru', 'Indonesia'),
('PDG', 'Minangkabau International Airport', 'Padang', 'Indonesia'),
('PNK', 'Supadio International Airport', 'Pontianak', 'Indonesia'),
('BDJ', 'Syamsudin Noor International Airport', 'Banjarmasin', 'Indonesia'),
('SIN', 'Changi Airport', 'Singapore', 'Singapore');

-- 12. CLAIM_MISSING_MILES (20 Data)
INSERT INTO CLAIM_MISSING_MILES (email_member, email_staf, maskapai, bandara_asal, bandara_tujuan, tanggal_penerbangan, flight_number, nomor_tiket, kelas_kabin, pnr, status_penerimaan, timestamp) VALUES
('andi.pratama@email.com', 'agus.staf@garuda.com', 'GA', 'CGK', 'DPS', '2025-08-01', 'GA-404', '126-111111', 'Economy', 'PNR001', 'Disetujui', '2025-08-10 10:00:00'),
('budi.santoso@email.com', NULL, 'QG', 'SUB', 'CGK', '2025-08-02', 'QG-717', '127-222222', 'Economy', 'PNR002', 'Menunggu', '2025-08-11 11:00:00'),
('citra.kirana@email.com', 'cici.staf@lion.com', 'JT', 'CGK', 'KNO', '2025-08-03', 'JT-202', '128-333333', 'Business', 'PNR003', 'Ditolak', '2025-08-12 12:00:00'),
('dewi.lestari@email.com', 'dedi.staf@batik.com', 'ID', 'UPG', 'CGK', '2025-08-04', 'ID-626', '129-444444', 'Economy', 'PNR004', 'Disetujui', '2025-08-13 13:00:00'),
('eka.putra@email.com', NULL, 'AK', 'CGK', 'SIN', '2025-08-05', 'AK-383', '130-555555', 'Economy', 'PNR005', 'Menunggu', '2025-08-14 14:00:00'),
('fajar.nugroho@email.com', 'feri.staf@garuda.com', 'GA', 'DPS', 'SUB', '2025-08-06', 'GA-414', '126-666666', 'Business', 'PNR006', 'Disetujui', '2025-08-15 15:00:00'),
('gita.gutawa@email.com', NULL, 'QG', 'KNO', 'CGK', '2025-08-07', 'QG-727', '127-777777', 'Economy', 'PNR007', 'Menunggu', '2025-08-16 16:00:00'),
('hadi.wijaya@email.com', 'hendra.staf@lion.com', 'JT', 'CGK', 'BPN', '2025-08-08', 'JT-212', '128-888888', 'Economy', 'PNR008', 'Ditolak', '2025-08-17 17:00:00'),
('intan.permata@email.com', 'ira.staf@batik.com', 'ID', 'YIA', 'CGK', '2025-08-09', 'ID-636', '129-999999', 'Business', 'PNR009', 'Disetujui', '2025-08-18 18:00:00'),
('joko.widodo@email.com', NULL, 'AK', 'SIN', 'DPS', '2025-08-10', 'AK-393', '130-000000', 'Economy', 'PNR010', 'Menunggu', '2025-08-19 19:00:00'),
('kartika.sari@email.com', 'agus.staf@garuda.com', 'GA', 'CGK', 'YIA', '2025-08-11', 'GA-424', '126-121212', 'Economy', 'PNR011', 'Disetujui', '2025-08-20 09:00:00'),
('lukman.hakim@email.com', NULL, 'QG', 'BPN', 'SUB', '2025-08-12', 'QG-737', '127-232323', 'Economy', 'PNR012', 'Menunggu', '2025-08-21 10:00:00'),
('maya.rumantir@email.com', 'cici.staf@lion.com', 'JT', 'SUB', 'DPS', '2025-08-13', 'JT-222', '128-343434', 'Economy', 'PNR013', 'Disetujui', '2025-08-22 11:00:00'),
('nur.hidayat@email.com', 'dedi.staf@batik.com', 'ID', 'CGK', 'PLM', '2025-08-14', 'ID-646', '129-454545', 'Business', 'PNR014', 'Disetujui', '2025-08-23 12:00:00'),
('oscar.lawalata@email.com', NULL, 'AK', 'CGK', 'BTH', '2025-08-15', 'AK-303', '130-565656', 'Economy', 'PNR015', 'Menunggu', '2025-08-24 13:00:00'),
('putri.marino@email.com', 'feri.staf@garuda.com', 'GA', 'SRG', 'CGK', '2025-08-16', 'GA-434', '126-676767', 'Economy', 'PNR016', 'Ditolak', '2025-08-25 14:00:00'),
('qori.sandioriva@email.com', NULL, 'QG', 'PKU', 'CGK', '2025-08-17', 'QG-747', '127-787878', 'Economy', 'PNR017', 'Menunggu', '2025-08-26 15:00:00'),
('reza.rahadian@email.com', 'hendra.staf@lion.com', 'JT', 'CGK', 'PDG', '2025-08-18', 'JT-232', '128-898989', 'Business', 'PNR018', 'Disetujui', '2025-08-27 16:00:00'),
('sari.wangi@email.com', 'ira.staf@batik.com', 'ID', 'PNK', 'CGK', '2025-08-19', 'ID-656', '129-909090', 'Economy', 'PNR019', 'Disetujui', '2025-08-28 17:00:00'),
('tari.lestar@email.com', NULL, 'AK', 'BDJ', 'SUB', '2025-08-20', 'AK-313', '130-010101', 'Economy', 'PNR020', 'Menunggu', '2025-08-29 18:00:00');

-- 13. TRANSFER (15 Data)
INSERT INTO TRANSFER (email_member_1, email_member_2, timestamp, jumlah, catatan) VALUES
('andi.pratama@email.com', 'budi.santoso@email.com', '2025-11-01 09:00:00', 500, 'Kado Nikah'),
('budi.santoso@email.com', 'citra.kirana@email.com', '2025-11-02 10:30:00', 1000, 'Ganti tiket kemarin'),
('citra.kirana@email.com', 'dewi.lestari@email.com', '2025-11-03 14:00:00', 2500, 'Ulang tahun'),
('dewi.lestari@email.com', 'eka.putra@email.com', '2025-11-04 11:15:00', 1500, 'Patungan liburan'),
('eka.putra@email.com', 'fajar.nugroho@email.com', '2025-11-05 16:45:00', 300, 'Sisa miles'),
('fajar.nugroho@email.com', 'gita.gutawa@email.com', '2025-11-06 08:20:00', 1200, 'Terima kasih'),
('gita.gutawa@email.com', 'hadi.wijaya@email.com', '2025-11-07 13:10:00', 800, 'Bayar hutang'),
('hadi.wijaya@email.com', 'intan.permata@email.com', '2025-11-08 15:50:00', 2000, 'Hadiah'),
('intan.permata@email.com', 'joko.widodo@email.com', '2025-11-09 10:05:00', 450, 'Bagi-bagi rezeki'),
('joko.widodo@email.com', 'kartika.sari@email.com', '2025-11-10 12:40:00', 3500, 'Bonus tahunan'),
('kartika.sari@email.com', 'lukman.hakim@email.com', '2025-11-11 09:30:00', 600, 'Sedekah'),
('lukman.hakim@email.com', 'maya.rumantir@email.com', '2025-11-12 14:25:00', 1800, 'Untuk tiket mudik'),
('maya.rumantir@email.com', 'nur.hidayat@email.com', '2025-11-13 11:55:00', 950, 'Kompensasi'),
('nur.hidayat@email.com', 'oscar.lawalata@email.com', '2025-11-14 16:15:00', 2200, 'Patungan hotel'),
('oscar.lawalata@email.com', 'putri.marino@email.com', '2025-11-15 08:50:00', 700, 'Bantu kawan');

-- 14. HADIAH (10 Data)
-- Otomatis men-generate RWD001 sampai RWD010. Menggunakan Penyedia 4-8 (Mitra)
INSERT INTO HADIAH (nama, miles, deskripsi, valid_start_date, program_end, id_penyedia) VALUES
('Voucher Diskon BCA Rp 100rb', 1500, 'Potongan belanja menggunakan kartu BCA', '2024-01-01', '2026-12-31', 4),
('Voucher Diskon BCA Rp 250rb', 3500, 'Potongan belanja premium BCA', '2024-01-01', '2026-12-31', 4),
('Cashback Mandiri Rp 50rb', 800, 'Cashback tagihan CC Mandiri', '2024-06-01', '2025-12-31', 5),
('Cashback Mandiri Rp 200rb', 2800, 'Cashback tagihan CC Mandiri Premium', '2024-06-01', '2025-12-31', 5),
('Voucher Traveloka Flight Rp 100rb', 1600, 'Diskon tiket pesawat di Traveloka', '2025-01-01', '2025-12-31', 6),
('Voucher Traveloka Hotel Rp 300rb', 4500, 'Diskon menginap di hotel Traveloka', '2025-01-01', '2025-12-31', 6),
('Diskon Tiket.com Kereta Api 20%', 1200, 'Diskon maksimal 50rb', '2025-03-01', '2026-03-01', 7),
('Diskon Tiket.com Pesawat 15%', 2500, 'Diskon maksimal 150rb', '2025-03-01', '2026-03-01', 7),
('Upgrade Kamar Hyatt', 10000, 'Upgrade tipe kamar ke Suite (jika tersedia)', '2024-11-01', '2027-11-01', 8),
('Free Breakfast Hyatt (2 Pax)', 5000, 'Gratis sarapan prasmanan di seluruh cabang', '2024-11-01', '2027-11-01', 8);

-- 15. REDEEM (20 Data)
INSERT INTO REDEEM (email_member, kode_hadiah, timestamp) VALUES
('andi.pratama@email.com', 'RWD001', '2025-12-01 08:00:00'),
('budi.santoso@email.com', 'RWD002', '2025-12-02 09:15:00'),
('citra.kirana@email.com', 'RWD003', '2025-12-03 10:30:00'),
('dewi.lestari@email.com', 'RWD004', '2025-12-04 11:45:00'),
('eka.putra@email.com', 'RWD005', '2025-12-05 13:00:00'),
('fajar.nugroho@email.com', 'RWD006', '2025-12-06 14:15:00'),
('gita.gutawa@email.com', 'RWD007', '2025-12-07 15:30:00'),
('hadi.wijaya@email.com', 'RWD008', '2025-12-08 16:45:00'),
('intan.permata@email.com', 'RWD009', '2025-12-09 18:00:00'),
('joko.widodo@email.com', 'RWD010', '2025-12-10 19:15:00'),
('kartika.sari@email.com', 'RWD001', '2025-12-11 08:30:00'),
('lukman.hakim@email.com', 'RWD002', '2025-12-12 09:45:00'),
('maya.rumantir@email.com', 'RWD003', '2025-12-13 11:00:00'),
('nur.hidayat@email.com', 'RWD004', '2025-12-14 12:15:00'),
('oscar.lawalata@email.com', 'RWD005', '2025-12-15 13:30:00'),
('putri.marino@email.com', 'RWD006', '2025-12-16 14:45:00'),
('qori.sandioriva@email.com', 'RWD007', '2025-12-17 16:00:00'),
('reza.rahadian@email.com', 'RWD008', '2025-12-18 17:15:00'),
('sari.wangi@email.com', 'RWD009', '2025-12-19 18:30:00'),
('tari.lestar@email.com', 'RWD010', '2025-12-20 19:45:00');