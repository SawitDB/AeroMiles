---------------------------------------------------------
-- fungsi trigger cek duplicate
---------------------------------------------------------
CREATE OR REPLACE FUNCTION check_duplicate_claim()
RETURNS TRIGGER AS $$
BEGIN
    -- Memeriksa apakah sudah ada klaim dengan kombinasi yang sama persis
    IF EXISTS (
        SELECT 1 FROM CLAIM_MISSING_MILES
        WHERE email_member = NEW.email_member
          AND flight_number = NEW.flight_number
          AND tanggal_penerbangan = NEW.tanggal_penerbangan
          AND nomor_tiket = NEW.nomor_tiket
    ) THEN
        RAISE EXCEPTION 'ERROR: Klaim untuk penerbangan "%" pada tanggal "%" dengan nomor tiket "%" sudah pernah diajukan sebelumnya.', 
            NEW.flight_number, NEW.tanggal_penerbangan, NEW.nomor_tiket;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger pada tabel CLAIM_MISSING_MILES
CREATE TRIGGER trigger_duplicate_missing_miles
BEFORE INSERT ON CLAIM_MISSING_MILES
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_claim();

---------------------------------------------------------
-- Fungsi trigger update member
---------------------------------------------------------
CREATE OR REPLACE FUNCTION update_member_tier()
RETURNS TRIGGER AS $$
DECLARE
    v_nama_tier_lama VARCHAR(50);
    v_id_tier_baru VARCHAR(10);
    v_nama_tier_baru VARCHAR(50);
BEGIN
    -- Mengecek apakah terjadi perubahan pada total_miles 
    IF NEW.total_miles IS DISTINCT FROM OLD.total_miles THEN
        
        -- Mendapatkan nama tier lama untuk ditampilkan di pesan
        SELECT nama INTO v_nama_tier_lama 
        FROM TIER 
        WHERE id_tier = OLD.id_tier;

        -- Menentukan tier baru berdasarkan nilai maksimal yang bisa dicapai
        SELECT id_tier, nama INTO v_id_tier_baru, v_nama_tier_baru
        FROM TIER
        WHERE minimal_tier_miles <= NEW.total_miles
        ORDER BY minimal_tier_miles DESC
        LIMIT 1;

        -- Jika tier berhak naik/turun (berbeda dari tier sebelumnya)
        IF v_id_tier_baru IS NOT NULL AND v_id_tier_baru != OLD.id_tier THEN
            
            -- Lakukan update id_tier
            NEW.id_tier := v_id_tier_baru;
            
            -- Tampilkan pesan SUKSES tanpa membatalkan transaksi (menggunakan NOTICE)
            RAISE NOTICE 'SUKSES: Tier Member "%" telah diperbarui dari "%" menjadi "%" berdasarkan total miles yang dimiliki.', 
                NEW.email, v_nama_tier_lama, v_nama_tier_baru;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger pada tabel MEMBER
CREATE TRIGGER trigger_update_tier_member
BEFORE UPDATE ON MEMBER
FOR EACH ROW
EXECUTE FUNCTION update_member_tier();