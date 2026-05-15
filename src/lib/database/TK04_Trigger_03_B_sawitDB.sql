-- TODO: bikin trigger 3
-- TRIGGER 03A: Validasi dan Update Saldo Award Miles saat Redeem Hadiah

CREATE OR REPLACE FUNCTION check_redeem_hadiah()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo     INT;
    v_miles     INT;
    v_nama      VARCHAR;
    v_start     DATE;
    v_end       DATE;
BEGIN
    SELECT miles, nama, valid_start_date, program_end
    INTO v_miles, v_nama, v_start, v_end
    FROM HADIAH
    WHERE kode_hadiah = NEW.kode_hadiah;

    IF CURRENT_DATE < v_start OR CURRENT_DATE > v_end THEN
        RAISE EXCEPTION 'ERROR: Hadiah "%" tidak tersedia pada periode ini.', v_nama;
    END IF;

    SELECT award_miles INTO v_saldo
    FROM MEMBER
    WHERE email = NEW.email_member;

    IF v_saldo < v_miles THEN
        RAISE EXCEPTION 'ERROR: Saldo award miles tidak mencukupi. Dibutuhkan % miles, saldo Anda: % miles.',
            v_miles, v_saldo;
    END IF;

    UPDATE MEMBER
    SET award_miles = award_miles - v_miles
    WHERE email = NEW.email_member;

    RAISE NOTICE 'SUKSES: Redeem hadiah "%" berhasil. Award miles Anda berkurang % miles.', v_nama, v_miles;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_redeem_hadiah
BEFORE INSERT ON REDEEM
FOR EACH ROW
EXECUTE FUNCTION check_redeem_hadiah();


-- TRIGGER 03B: Sinkronisasi Award Miles setelah Pembelian Package

CREATE OR REPLACE FUNCTION sync_miles_beli_package()
RETURNS TRIGGER AS $$
DECLARE
    v_jumlah INT;
BEGIN
    SELECT jumlah_award_miles INTO v_jumlah
    FROM AWARD_MILES_PACKAGE
    WHERE id = NEW.id_award_miles_package;

    UPDATE MEMBER
    SET award_miles = award_miles + v_jumlah,
        total_miles = total_miles + v_jumlah
    WHERE email = NEW.email_member;

    RAISE NOTICE 'SUKSES: Pembelian package berhasil. Award miles dan total miles Anda bertambah % miles.', v_jumlah;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_beli_package
AFTER INSERT ON MEMBER_AWARD_MILES_PACKAGE
FOR EACH ROW
EXECUTE FUNCTION sync_miles_beli_package();