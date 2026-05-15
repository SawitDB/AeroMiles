"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface Tier {
  id_tier: string;
  nama: string;
  minimal_frekuensi_terbang: number;
  minimal_tier_miles: number;
}

const TIER_COLORS: Record<string, string> = {
  BLUE: "#60a5fa",
  SILV: "#94a3b8",
  GOLD: "#f59e0b",
  PLAT: "#8b5cf6",
};

const TIER_BENEFITS: Record<string, string> = {
  BLUE: "Akses program miles dasar, penawaran mitra terpilih",
  SILV: "Priority check-in, bonus miles 25%, diskon lounge",
  GOLD: "Akses lounge gratis, bonus miles 50%, upgrade prioritas",
  PLAT: "Layanan concierge 24/7, bonus miles 100%, upgrade gratis",
};

export default function InfoTierPage() {
  const router = useRouter();
  const { user, isHydrated: authHydrated } = useAuth();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [memberTier, setMemberTier] = useState<string>('BLUE');
  const [totalMiles, setTotalMiles] = useState(0);
  const [nextTier, setNextTier] = useState<Tier | null>(null);
  const [isHighestTier, setIsHighestTier] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [milesNeeded, setMilesNeeded] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "member") {
      router.replace("/dashboard");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/info-tier?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setTiers(data.tiers);
          setMemberTier(data.current_tier.id_tier);
          setTotalMiles(data.member.total_miles);
          setNextTier(data.next_tier);
          setIsHighestTier(data.is_highest_tier);
          setProgressPercent(data.progress_percent);
          setMilesNeeded(data.miles_needed);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
      setHydrated(true);
    })();
  }, [authHydrated, user, router]);

  if (!hydrated || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary-700 to-secondary-500 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Informasi Tier</h1>
        <p className="mb-8 text-white">
          Ketahui tier membership kamu dan dapatkan benefit eksklusif
        </p>

        {/* CARD 1: Progress Bar Card */}
        <div className="mb-6 rounded-lg bg-white/10 px-6 py-4 p-6 ">
          <h2 className="mb-4 text-xl font-bold text-white">Progres Tier Kamu</h2>

          <p className="mb-4 text-sm text-white text-opacity-80">
            Total Miles: <span className="font-bold">{totalMiles.toLocaleString("id-ID")}</span>
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-3 w-full rounded-full bg-gray-200 ">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: TIER_COLORS[memberTier ?? 'BLUE'],
                }}
              />
            </div>
          </div>

          {/* Progress text */}
          <p className="text-sm text-white ">
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
            const isCurrentTier = tier.id_tier === (memberTier ?? 'BLUE');
            const borderClass = isCurrentTier
              ? "shadow-xl shadow-amber-400 border-4 border-solid border-amber-4000"
              : "border-4 border-solid border-secondary-300";
            const bgClass = isCurrentTier ? "bg-amber-100" : "bg-white";

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
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white bg-amber-900">
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
