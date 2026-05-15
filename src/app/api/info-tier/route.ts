import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const memberRes = await pool.query(
      'SELECT email, nomor_member, tanggal_bergabung, id_tier, award_miles, total_miles FROM MEMBER WHERE email = $1',
      [email]
    );

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const member = memberRes.rows[0];

    const tiersRes = await pool.query(
      'SELECT * FROM TIER ORDER BY minimal_tier_miles ASC'
    );

    const tiers = tiersRes.rows;

    const currentTierIndex = tiers.findIndex((t: any) => t.id_tier === member.id_tier);
    const isHighestTier = currentTierIndex === tiers.length - 1;
    const currentTier = tiers[currentTierIndex] || null;
    const nextTier = isHighestTier ? null : tiers[currentTierIndex + 1];

    let progressPercent = 100;
    let milesNeeded = 0;

    if (!isHighestTier && nextTier && currentTier) {
      const currentMin = currentTier.minimal_tier_miles;
      const nextMin = nextTier.minimal_tier_miles;
      const milesInCurrentTier = member.total_miles - currentMin;
      const milesRequiredForNext = nextMin - currentMin;
      progressPercent = milesRequiredForNext > 0
        ? Math.min(100, Math.max(0, Math.round((milesInCurrentTier / milesRequiredForNext) * 100)))
        : 100;
      milesNeeded = Math.max(0, nextMin - member.total_miles);
    }

    return NextResponse.json({
      member: {
        email: member.email,
        nomor_member: member.nomor_member,
        tanggal_bergabung: member.tanggal_bergabung,
        id_tier: member.id_tier,
        award_miles: member.award_miles,
        total_miles: member.total_miles,
      },
      tiers,
      current_tier: currentTier,
      next_tier: nextTier,
      is_highest_tier: isHighestTier,
      progress_percent: progressPercent,
      miles_needed: milesNeeded,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
