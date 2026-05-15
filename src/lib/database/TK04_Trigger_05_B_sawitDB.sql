-- TODO: bikin trigger 5
-- TRIGGER 05A: Sinkronisasi Total Miles setelah Klaim Disetujui

CREATE OR REPLACE FUNCTION sync_miles_klaim_disetujui()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_penerimaan = 'Disetujui' AND OLD.status_penerimaan <> 'Disetujui' THEN
        UPDATE MEMBER
        SET award_miles = award_miles + 1000,
            total_miles = total_miles + 1000
        WHERE email = NEW.email_member;

        RAISE NOTICE 'SUKSES: Total miles Member "%" telah diperbarui. Miles ditambahkan: 1000 miles dari klaim penerbangan "%".',
            NEW.email_member, NEW.flight_number;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_klaim_disetujui
AFTER UPDATE OF status_penerimaan ON CLAIM_MISSING_MILES
FOR EACH ROW
EXECUTE FUNCTION sync_miles_klaim_disetujui();


-- STORED PROCEDURE 05B: Pemeringkatan Top 5 Member berdasarkan Total Miles

CREATE OR REPLACE FUNCTION get_top5_member()
RETURNS TABLE (
    rank        BIGINT,
    email       VARCHAR,
    nama        TEXT,
    total_miles INT,
    id_tier     VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY m.total_miles DESC) AS rank,
        m.email,
        (p.salutation || ' ' || p.first_mid_name || ' ' || p.last_name)::TEXT AS nama,
        m.total_miles,
        m.id_tier
    FROM MEMBER m
    JOIN PENGGUNA p ON p.email = m.email
    ORDER BY m.total_miles DESC
    LIMIT 5;

    RAISE NOTICE 'SUKSES: Daftar Top 5 Member berdasarkan total miles berhasil diperbarui, dengan peringkat pertama memiliki % miles.',
        (SELECT total_miles FROM MEMBER ORDER BY total_miles DESC LIMIT 1);
END;
$$ LANGUAGE plpgsql;