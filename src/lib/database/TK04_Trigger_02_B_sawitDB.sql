-- TRIGGER 02: Pencegahan Transfer Melebihi Saldo + Pencatatan Log Transfer

-- TRIGGER 02: Pencegahan Transfer Melebihi Saldo + Pencatatan Log Transfer

CREATE OR REPLACE FUNCTION check_transfer_saldo()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo INT;
BEGIN
    SELECT award_miles INTO v_saldo
    FROM MEMBER
    WHERE email = NEW.email_member_1;

    IF v_saldo < NEW.jumlah THEN
        RAISE EXCEPTION 'ERROR: Saldo award miles tidak mencukupi. Saldo Anda saat ini: % miles, jumlah transfer: % miles.',
            v_saldo, NEW.jumlah;
    END IF;

    -- Kurangi award_miles pengirim
    UPDATE MEMBER
    SET award_miles = award_miles - NEW.jumlah
    WHERE email = NEW.email_member_1;

    -- Tambah award_miles dan total_miles penerima
    UPDATE MEMBER
    SET award_miles = award_miles + NEW.jumlah,
        total_miles = total_miles + NEW.jumlah
    WHERE email = NEW.email_member_2;

    RAISE NOTICE 'SUKSES: Transfer % miles dari "%" ke "%" berhasil dicatat.',
        NEW.jumlah, NEW.email_member_1, NEW.email_member_2;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transfer_miles
BEFORE INSERT ON TRANSFER
FOR EACH ROW
EXECUTE FUNCTION check_transfer_saldo();