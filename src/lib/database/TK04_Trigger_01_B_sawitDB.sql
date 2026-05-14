CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- TRIGGER: Cegah duplikasi email saat registrasi
CREATE OR REPLACE FUNCTION check_duplicate_email()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM PENGGUNA
        WHERE LOWER(email) = LOWER(NEW.email)
    ) THEN
        RAISE EXCEPTION 'ERROR: Email "%" sudah terdaftar, silakan gunakan email lain.', NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrasi_email
BEFORE INSERT ON PENGGUNA
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_email();

-- Fungsi untuk verifikasi login
CREATE OR REPLACE FUNCTION verifikasi_login(p_email VARCHAR, p_password VARCHAR)
RETURNS TABLE(
    email VARCHAR,
    salutation VARCHAR,
    first_mid_name VARCHAR,
    last_name VARCHAR,
    country_code VARCHAR,
    mobile_number VARCHAR,
    tanggal_lahir DATE,
    kewarganegaraan VARCHAR,
    role VARCHAR,
    nomor_member VARCHAR,
    id_tier VARCHAR,
    tanggal_bergabung DATE,
    id_staf VARCHAR,
    kode_maskapai VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.email::VARCHAR,
        p.salutation::VARCHAR,
        p.first_mid_name::VARCHAR,
        p.last_name::VARCHAR,
        p.country_code::VARCHAR,
        p.mobile_number::VARCHAR,
        p.tanggal_lahir::DATE,
        p.kewarganegaraan::VARCHAR,
        CASE WHEN m.email IS NOT NULL THEN 'member'::VARCHAR WHEN s.email IS NOT NULL THEN 'staf'::VARCHAR END,
        m.nomor_member::VARCHAR,
        m.id_tier::VARCHAR,
        m.tanggal_bergabung::DATE,
        s.id_staf::VARCHAR,
        s.kode_maskapai::VARCHAR
    FROM pengguna p
    LEFT JOIN member m ON m.email = p.email
    LEFT JOIN staf s ON s.email = p.email
    WHERE LOWER(p.email) = LOWER(p_email)
      AND p.password = crypt(p_password, p.password);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Email atau password salah, silahkan coba lagi';
    END IF;
END;
$$ LANGUAGE plpgsql;