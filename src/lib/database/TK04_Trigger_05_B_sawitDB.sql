-- 1. Sinkronisasi Total Miles Member setelah Klaim Missing Miles Disetujui
CREATE OR REPLACE FUNCTION trigger_sync_miles_claim()
RETURNS TRIGGER AS $$
DECLARE
    v_email_member VARCHAR(100);
    v_flight_number VARCHAR(10);
BEGIN
    -- Cek jika status berubah dari 'Menunggu' ke 'Disetujui'
    IF (OLD.status_penerimaan = 'Menunggu' AND NEW.status_penerimaan = 'Disetujui') THEN
        v_email_member := NEW.email_member;
        v_flight_number := NEW.flight_number;

        -- Update miles member
        UPDATE MEMBER
        SET award_miles = award_miles + 1000,
            total_miles = total_miles + 1000
        WHERE email = v_email_member;

        -- Raise NOTICE untuk menampilkan pesan sukses (akan ditangkap oleh backend)
        -- Pesan: "SUKSES: Total miles Member \"<email member>\" telah diperbarui. Miles ditambahkan: 1000 miles dari klaim penerbangan \"<flight_number>\"."
        RAISE NOTICE 'SUKSES: Total miles Member "%" telah diperbarui. Miles ditambahkan: 1000 miles dari klaim penerbangan "%".', v_email_member, v_flight_number;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_miles_claim ON CLAIM_MISSING_MILES;
CREATE TRIGGER trg_sync_miles_claim
AFTER UPDATE ON CLAIM_MISSING_MILES
FOR EACH ROW
EXECUTE FUNCTION trigger_sync_miles_claim();


-- 2. Pemeringkatan Top 5 Member berdasarkan Total Miles
CREATE OR REPLACE FUNCTION get_top_5_members()
RETURNS TABLE(
    peringkat INT,
    email VARCHAR(100),
    total_miles INT,
    message TEXT
) AS $$
DECLARE
    v_first_email VARCHAR(100);
    v_first_miles INT;
BEGIN
    -- Ambil info peringkat pertama untuk pesan
    SELECT m.email, m.total_miles INTO v_first_email, v_first_miles
    FROM MEMBER m
    ORDER BY m.total_miles DESC
    LIMIT 1;

    -- Return tabel hasil peringkat
    RETURN QUERY
    SELECT 
        CAST(row_number() OVER (ORDER BY m.total_miles DESC) AS INT) as peringkat,
        m.email,
        m.total_miles,
        -- Pesan: "SUKSES: Daftar Top 5 Member berdasarkan total miles berhasil diperbarui, dengan peringkat pertama \"<email>\" memiliki <total miles> miles."
        CAST('SUKSES: Daftar Top 5 Member berdasarkan total miles berhasil diperbarui, dengan peringkat pertama "' || v_first_email || '" memiliki ' || v_first_miles || ' miles.' AS TEXT) as message
    FROM MEMBER m
    ORDER BY m.total_miles DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;
