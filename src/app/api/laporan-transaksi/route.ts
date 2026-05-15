import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const [totalMilesRes, redeemCountRes, claimCountRes] = await Promise.all([
        pool.query('SELECT COALESCE(SUM(total_miles), 0) as total FROM MEMBER'),
        pool.query(
          `SELECT COUNT(*) as count FROM REDEEM
           WHERE EXTRACT(MONTH FROM timestamp) = EXTRACT(MONTH FROM NOW())
             AND EXTRACT(YEAR FROM timestamp) = EXTRACT(YEAR FROM NOW())`
        ),
        pool.query(
          `SELECT COUNT(*) as count FROM CLAIM_MISSING_MILES
           WHERE status_penerimaan = 'Disetujui'`
        ),
      ]);

      return NextResponse.json({
        total_miles_beredar: parseInt(totalMilesRes.rows[0].total, 10),
        total_redeem_bulan_ini: parseInt(redeemCountRes.rows[0].count, 10),
        total_klaim_disetujui: parseInt(claimCountRes.rows[0].count, 10),
      });
    }

    if (action === 'transactions') {
      const typeFilter = searchParams.get('type');
      const fromDate = searchParams.get('from');
      const toDate = searchParams.get('to');

      let conditions = '';
      const params: any[] = [];
      let paramIndex = 0;

      if (typeFilter && typeFilter !== 'all') {
        paramIndex++;
        conditions += ` AND type = $${paramIndex}`;
        params.push(typeFilter);
      }
      if (fromDate) {
        paramIndex++;
        conditions += ` AND timestamp >= $${paramIndex}`;
        params.push(fromDate);
      }
      if (toDate) {
        paramIndex++;
        conditions += ` AND timestamp <= $${paramIndex}`;
        params.push(toDate);
      }

      const whereClause = conditions ? `WHERE 1=1${conditions}` : '';

      const query = `
        SELECT * FROM (
          SELECT
            'Transfer' as type,
            t.email_member_2 as email_member,
            mem2.nomor_member,
            t.jumlah as jumlah_miles,
            t.timestamp,
            t.email_member_1 as related,
            'receiver' as transfer_role,
            json_build_array(
              t.email_member_1, t.email_member_2, t.timestamp::text
            ) as delete_key
          FROM TRANSFER t
          JOIN MEMBER mem2 ON mem2.email = t.email_member_2

          UNION ALL

          SELECT
            'Transfer' as type,
            t.email_member_1 as email_member,
            mem1.nomor_member,
            -t.jumlah as jumlah_miles,
            t.timestamp,
            t.email_member_2 as related,
            'sender' as transfer_role,
            json_build_array(
              t.email_member_1, t.email_member_2, t.timestamp::text
            ) as delete_key
          FROM TRANSFER t
          JOIN MEMBER mem1 ON mem1.email = t.email_member_1

          UNION ALL

          SELECT
            'Redeem' as type,
            r.email_member,
            mem.nomor_member,
            -h.miles as jumlah_miles,
            r.timestamp,
            h.nama as related,
            NULL as transfer_role,
            json_build_array(
              r.email_member, r.kode_hadiah, r.timestamp::text
            ) as delete_key
          FROM REDEEM r
          JOIN HADIAH h ON h.kode_hadiah = r.kode_hadiah
          JOIN MEMBER mem ON mem.email = r.email_member

          UNION ALL

          SELECT
            'Pembelian' as type,
            m.email_member,
            mem.nomor_member,
            p.jumlah_award_miles as jumlah_miles,
            m.timestamp,
            p.id as related,
            NULL as transfer_role,
            json_build_array(
              m.id_award_miles_package, m.email_member, m.timestamp::text
            ) as delete_key
          FROM MEMBER_AWARD_MILES_PACKAGE m
          JOIN AWARD_MILES_PACKAGE p ON p.id = m.id_award_miles_package
          JOIN MEMBER mem ON mem.email = m.email_member

          UNION ALL

          SELECT
            'Klaim' as type,
            c.email_member,
            mem.nomor_member,
            1000 as jumlah_miles,
            c.timestamp,
            c.flight_number as related,
            NULL as transfer_role,
            json_build_array(c.id) as delete_key
          FROM CLAIM_MISSING_MILES c
          JOIN MEMBER mem ON mem.email = c.email_member
          WHERE c.status_penerimaan = 'Disetujui'
        ) AS all_transactions
        ${whereClause}
        ORDER BY timestamp DESC
      `;

      const res = await pool.query(query, params);
      return NextResponse.json(res.rows);
    }

    if (action === 'top-member') {
      const query = `
        SELECT
          m.email,
          m.nomor_member,
          m.total_miles,
          COALESCE((
            SELECT COUNT(*) FROM (
              SELECT m.email AS email_member FROM TRANSFER WHERE email_member_1 = m.email OR email_member_2 = m.email
              UNION ALL
              SELECT email_member FROM REDEEM WHERE email_member = m.email
              UNION ALL
              SELECT email_member FROM MEMBER_AWARD_MILES_PACKAGE WHERE email_member = m.email
              UNION ALL
              SELECT email_member FROM CLAIM_MISSING_MILES WHERE email_member = m.email AND status_penerimaan = 'Disetujui'
            ) AS t
          ), 0) as jumlah_transaksi
        FROM MEMBER m
        ORDER BY m.total_miles DESC
      `;

      const res = await pool.query(query);
      return NextResponse.json(res.rows);
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { type, delete_key } = await req.json();

    if (!type || !delete_key) {
      return NextResponse.json({ error: 'Type dan delete_key diperlukan' }, { status: 400 });
    }

    if (type === 'Klaim') {
      return NextResponse.json({ error: 'Riwayat Klaim yang sudah disetujui tidak dapat dihapus' }, { status: 400 });
    }

    if (type === 'Transfer') {
      const [email_member_1, email_member_2, timestamp] = delete_key;
      await pool.query(
        'DELETE FROM TRANSFER WHERE email_member_1 = $1 AND email_member_2 = $2 AND timestamp = $3',
        [email_member_1, email_member_2, timestamp]
      );
      return NextResponse.json({ success: true });
    }

    if (type === 'Redeem') {
      const [email_member, kode_hadiah, timestamp] = delete_key;
      await pool.query(
        'DELETE FROM REDEEM WHERE email_member = $1 AND kode_hadiah = $2 AND timestamp = $3',
        [email_member, kode_hadiah, timestamp]
      );
      return NextResponse.json({ success: true });
    }

    if (type === 'Pembelian') {
      const [id_award_miles_package, email_member, timestamp] = delete_key;
      await pool.query(
        'DELETE FROM MEMBER_AWARD_MILES_PACKAGE WHERE id_award_miles_package = $1 AND email_member = $2 AND timestamp = $3',
        [id_award_miles_package, email_member, timestamp]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Tipe transaksi tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
