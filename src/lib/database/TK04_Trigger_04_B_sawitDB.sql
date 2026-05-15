-- TRIGGER 04A: Pemeriksaan Duplikat Klaim Missing Miles

CREATE OR REPLACE FUNCTION check_duplicate_klaim()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM CLAIM_MISSING_MILES
        WHERE email_member       = NEW.email_member
          AND flight_number      = NEW.flight_number
          AND tanggal_penerbangan = NEW.tanggal_penerbangan
          AND nomor_tiket        = NEW.nomor_tiket
    ) THEN
        RAISE EXCEPTION 'ERROR: Klaim untuk penerbangan "%" pada tanggal "%" dengan nomor tiket "%" sudah pernah diajukan sebelumnya.',
            NEW.flight_number, NEW.tanggal_penerbangan, NEW.nomor_tiket;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cek_duplikat_klaim
BEFORE INSERT ON CLAIM_MISSING_MILES
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_klaim();


-- TRIGGER 04B: Pembaruan Tier Member Otomatis berdasarkan Total Miles

CREATE OR REPLACE FUNCTION update_tier_member()
RETURNS TRIGGER AS $$
DECLARE
    v_tier_lama  VARCHAR;
    v_tier_baru  VARCHAR;
BEGIN
    v_tier_lama := NEW.id_tier;

    SELECT id_tier INTO v_tier_baru
    FROM TIER
    WHERE minimal_tier_miles <= NEW.total_miles
    ORDER BY minimal_tier_miles DESC
    LIMIT 1;

    IF v_tier_baru IS NOT NULL AND v_tier_baru <> v_tier_lama THEN
        NEW.id_tier := v_tier_baru;

        RAISE NOTICE 'SUKSES: Tier Member "%" telah diperbarui dari "%" menjadi "%" berdasarkan total miles yang dimiliki.',
            NEW.email, v_tier_lama, v_tier_baru;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tier
BEFORE UPDATE OF total_miles ON MEMBER
FOR EACH ROW
EXECUTE FUNCTION update_tier_member();