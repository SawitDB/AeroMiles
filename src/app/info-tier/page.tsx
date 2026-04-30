"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFromStorage } from "@/lib/storage";

interface Tier {
  id_tier: string;
  nama: string;
  minimal_frekuensi_terbang: number;
  minimal_tier_miles: number;
}

interface SessionData {
  email: string;
  role: string;
  id_tier: string;
  total_miles: number;
}

const TIER_COLORS: Record<string, string> = {
  BLUE: "#60a5fa",
  SILVER: "#94a3b8",
  GOLD: "#f59e0b",
  PLATINUM: "#8b5cf6",
};

const TIER_BENEFITS: Record<string, string> = {
  BLUE: "Akses program miles dasar, penawaran mitra terpilih",
  SILVER: "Priority check-in, bonus miles 25%, diskon lounge",
  GOLD: "Akses lounge gratis, bonus miles 50%, upgrade prioritas",
  PLATINUM: "Layanan concierge 24/7, bonus miles 100%, upgrade gratis",
};

const TIER_ORDER = ["BLUE", "SILVER", "GOLD", "PLATINUM"];

export default function InfoTierPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Read session
    const sessionStr = localStorage.getItem("aeromiles_session");
    if (!sessionStr) {
      router.replace("/login");
      return;
    }

    const sessionData = JSON.parse(sessionStr);
    if (sessionData.role !== "member") {
      router.replace("/dashboard");
      return;
    }

    setSession(sessionData);

    // Read tiers
    const tiersData = getFromStorage<Tier>("aeromiles_tier");
    setTiers(tiersData);
    setHydrated(true);
  }, [router]);

  if (!hydrated || !session) {
    return null;
  }

  const currentTierIndex = TIER_ORDER.indexOf(session.id_tier);
  const nextTierIndex = currentTierIndex + 1;
  const isHighestTier = currentTierIndex === TIER_ORDER.length - 1;
  const nextTier = isHighestTier
    ? null
    : tiers.find((t) => t.id_tier === TIER_ORDER[nextTierIndex]);

  const milesNeeded = isHighestTier
    ? 0
    : Math.max(0, (nextTier?.minimal_tier_miles || 0) - (session.total_miles || 0));

  const progressPercent = isHighestTier
    ? 100
    : Math.min(
        100,
        ((session.total_miles || 0) / (nextTier?.minimal_tier_miles || 1)) * 100
      );

  const currentTier = tiers.find((t) => t.id_tier === session.id_tier);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Informasi Tier</h1>
        <p className="mb-8 text-gray-600">
          Ketahui tier membership kamu dan dapatkan benefit eksklusif
        </p>

        {/* CARD 1: Progress Bar Card */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Progres Tier Kamu</h2>

          <div className="mb-4 flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: TIER_COLORS[session.id_tier] }}
            >
              {session.id_tier.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-gray-600">Tier Saat Ini</p>
              <p className="text-lg font-bold text-gray-900">
                {currentTier?.nama || session.id_tier}
              </p>
            </div>
          </div>

          <p className="mb-4 text-sm text-gray-700">
            Total Miles: <span className="font-bold">{session.total_miles || 0}</span>
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-3 w-full rounded-full bg-gray-200">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: TIER_COLORS[session.id_tier],
                }}
              />
            </div>
          </div>

          {/* Progress text */}
          <p className="text-sm text-gray-700">
            {isHighestTier ? (
              <span className="text-green-600 font-semibold">
                🎉 Selamat! Kamu sudah berada di tier tertinggi
              </span>
            ) : (
              <span>
                {milesNeeded} miles lagi untuk mencapai tier{" "}
                <span className="font-bold">{nextTier?.nama}</span>
              </span>
            )}
          </p>
        </div>

        {/* CARDS 2-5: Tier Cards */}
        <div className="space-y-4">
          {tiers.map((tier) => {
            const isCurrentTier = tier.id_tier === session.id_tier;
            const borderClass = isCurrentTier
              ? "border-2"
              : "border border-gray-200";
            const bgClass = isCurrentTier ? "bg-blue-50" : "bg-white";

            return (
              <div
                key={tier.id_tier}
                className={`rounded-lg p-6 shadow ${bgClass} ${borderClass}`}
                style={{
                  borderColor: isCurrentTier ? TIER_COLORS[tier.id_tier] : undefined,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: TIER_COLORS[tier.id_tier] }}
                      >
                        {tier.id_tier.charAt(0)}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {tier.nama}
                      </h3>
                    </div>
                  </div>
                  {isCurrentTier && (
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-gray-900 bg-yellow-100">
                      Tier Kamu Saat Ini ✓
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Minimal Frekuensi Terbang:</span>{" "}
                    {tier.minimal_frekuensi_terbang} penerbangan
                  </p>
                  <p>
                    <span className="font-semibold">Minimal Tier Miles:</span>{" "}
                    {tier.minimal_tier_miles.toLocaleString("id-ID")} miles
                  </p>
                  <p>
                    <span className="font-semibold">Keuntungan:</span>{" "}
                    {TIER_BENEFITS[tier.id_tier]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
