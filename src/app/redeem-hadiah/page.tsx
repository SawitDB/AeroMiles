"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ConfirmModal from "@/components/ConfirmModal";

interface Hadiah {
  kode_hadiah: string;
  nama: string;
  miles: number;
  deskripsi: string;
  valid_start_date: string;
  program_end: string;
  id_penyedia: string;
  nama_penyedia: string;
}

interface Redeem {
  email_member: string;
  kode_hadiah: string;
  nama_hadiah: string;
  miles_used: number;
  timestamp: string;
}

type Tab = "katalog" | "riwayat";

export default function RedeemHadiahPage() {
  const router = useRouter();
  const { user, isHydrated: authHydrated } = useAuth();
  const [hadiah, setHadiah] = useState<Hadiah[]>([]);
  const [redeemHistory, setRedeemHistory] = useState<Redeem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("katalog");
  const [awardMiles, setAwardMiles] = useState(0);
  const [selectedHadiah, setSelectedHadiah] = useState<Hadiah | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [hadiahRes, redeemRes, memberRes] = await Promise.all([
        fetch("/api/hadiah?available=true"),
        fetch(`/api/redeem?email=${encodeURIComponent(user.email)}`),
        fetch(`/api/member?email=${encodeURIComponent(user.email)}`),
      ]);
      if (hadiahRes.ok) setHadiah(await hadiahRes.json());
      if (redeemRes.ok) setRedeemHistory(await redeemRes.json());
      if (memberRes.ok) {
        const memberData = await memberRes.json();
        setAwardMiles(memberData.award_miles || 0);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
    setHydrated(true);
  };

  useEffect(() => {
    if (!authHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "member") {
      router.replace("/dashboard");
      return;
    }
    fetchData();
  }, [authHydrated, user, router]);

  if (!hydrated || !user) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isValidToday = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return today >= start && today <= end;
  };

  const availableHadiah = hadiah.filter((h) =>
    isValidToday(h.valid_start_date, h.program_end)
  );

  const handleRedeem = (item: Hadiah) => {
    if (awardMiles < item.miles) {
      showNotification("error", `Award miles tidak cukup. Dibutuhkan ${item.miles} miles, tersedia ${awardMiles} miles.`);
      return;
    }
    if (!isValidToday(item.valid_start_date, item.program_end)) {
      showNotification("error", "Hadiah ini sudah tidak tersedia lagi.");
      return;
    }
    setSelectedHadiah(item);
    setShowModal(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedHadiah) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_member: user.email, kode_hadiah: selectedHadiah.kode_hadiah }),
      });
      const body = await res.json();
      if (!res.ok) {
        showNotification("error", body.error || "Gagal redeem");
        return;
      }
      showNotification("success", body.message);
      setShowModal(false);
      setSelectedHadiah(null);
      await fetchData();
    } catch (err) {
      showNotification("error", "Gagal redeem, silakan coba lagi.");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary-700 to-secondary-500 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Redeem Hadiah</h1>
        <p className="mb-8 text-white">
          Tukarkan award miles kamu dengan hadiah menarik
        </p>

        <div className="mb-6 rounded-lg bg-white/10 px-6 py-4 text-white">
          <p className="text-sm opacity-80">Award Miles Kamu</p>
          <p className="text-2xl font-bold">{awardMiles.toLocaleString("id-ID")} miles</p>
        </div>

        <div className="mb-8 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("katalog")}
            className={`pb-3 font-semibold transition-colors ${
              activeTab === "katalog"
                ? "border-b-2 border-primary text-primary"
                : "text-white hover:text-gray-400"
            }`}
          >
            Katalog Hadiah
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`pb-3 font-semibold transition-colors ${
              activeTab === "riwayat"
                ? "border-b-2 border-primary text-primary"
                : "text-white hover:text-gray-400"
            }`}
          >
            Riwayat Redeem
          </button>
        </div>

        {loading ? (
          <p className="text-center text-white py-12">Memuat...</p>
        ) : activeTab === "katalog" ? (
          <div>
            {availableHadiah.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                Tidak ada hadiah yang tersedia saat ini.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {availableHadiah.map((item) => {
                  const isExpanded = expandedDesc === item.kode_hadiah;
                  const canRedeem = awardMiles >= item.miles;

                  return (
                    <div
                      key={item.kode_hadiah}
                      className="flex flex-col rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
                    >
                      <h3 className="mb-2 text-lg font-bold text-gray-900">
                        {item.nama}
                      </h3>
                      <p className="mb-3 text-sm text-gray-600">
                        <span className="font-semibold">{item.nama_penyedia}</span>
                      </p>

                      <p className="mb-4 text-2xl font-bold text-primary">
                        {item.miles.toLocaleString("id-ID")} miles
                      </p>

                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {item.deskripsi}
                        </p>
                        {item.deskripsi && item.deskripsi.length > 100 && (
                          <button
                            onClick={() =>
                              setExpandedDesc(
                                isExpanded ? null : item.kode_hadiah
                              )
                            }
                            className="mt-2 text-sm text-primary font-semibold hover:underline"
                          >
                            {isExpanded ? "Sembunyikan" : "Lihat Selengkapnya"}
                          </button>
                        )}
                        {isExpanded && (
                          <p className="mt-2 text-sm text-gray-700">
                            {item.deskripsi}
                          </p>
                        )}
                      </div>

                      <p className="mb-4 text-xs text-gray-500">
                        Periode: {item.valid_start_date} s.d. {item.program_end}
                      </p>

                      <button
                        onClick={() => handleRedeem(item)}
                        disabled={!canRedeem}
                        className={`mt-auto rounded-lg px-4 py-3 font-semibold transition-colors ${
                          canRedeem
                            ? "bg-primary text-white hover:bg-primary-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {canRedeem ? "Redeem" : "Miles Tidak Cukup"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow overflow-x-auto">
            {redeemHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                Kamu belum melakukan redeem hadiah.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">#</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Detail Hadiah</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Waktu</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Miles Digunakan</th>
                  </tr>
                </thead>
                <tbody>
                  {redeemHistory.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">{idx + 1}</td>
                      <td className="px-6 py-4 text-gray-900">
                        <p className="font-semibold">{item.nama_hadiah}</p>
                        <p className="text-xs text-gray-500">{item.kode_hadiah}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(item.timestamp).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        {item.miles_used.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-6 py-4 pr-12 shadow-2xl text-white transition-all ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <span className="text-xl">
            {notification.type === "success" ? "✅" : "❌"}
          </span>
          <p className="font-medium">{notification.message}</p>
          <button
            onClick={() => setNotification(null)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showModal}
        title="Konfirmasi Redeem"
        body={
          selectedHadiah ? (
            <div className="space-y-2 text-gray-700">
              <p>
                Award miles kamu sebesar{" "}
                <span className="font-bold">{awardMiles.toLocaleString("id-ID")}</span>{" "}
                miles akan dipotong untuk mendapatkan{" "}
                <span className="font-bold">{selectedHadiah.nama}</span>.
              </p>
              <p className="pt-2 border-t">
                Sisa miles kamu setelah redeem:{" "}
                <span className="text-primary font-bold">
                  {(awardMiles - selectedHadiah.miles).toLocaleString("id-ID")}
                </span>{" "}
                miles.
              </p>
            </div>
          ) : null
        }
        onCancel={() => {
          setShowModal(false);
          setSelectedHadiah(null);
        }}
        onConfirm={handleConfirmRedeem}
        confirmLabel={redeeming ? "Memproses..." : "Redeem"}
        confirmVariant="primary"
      />
    </main>
  );
}
