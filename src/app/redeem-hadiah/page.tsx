"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFromStorage, saveToStorage } from "@/lib/storage";
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

interface SessionData {
  email: string;
  role: string;
  award_miles: number;
}

type Tab = "katalog" | "riwayat";

export default function RedeemHadiahPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [hadiah, setHadiah] = useState<Hadiah[]>([]);
  const [redeemHistory, setRedeemHistory] = useState<Redeem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("katalog");
  const [awardMiles, setAwardMiles] = useState(0);
  const [selectedHadiah, setSelectedHadiah] = useState<Hadiah | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);

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
    setAwardMiles(sessionData.award_miles || 0);

    // Read hadiah and redeem history
    const hadiahData = getFromStorage<Hadiah>("aeromiles_hadiah");
    const redeemData = getFromStorage<Redeem>("aeromiles_redeem");
    setHadiah(hadiahData);
    setRedeemHistory(redeemData);
    setHydrated(true);

    // Listen for session changes
    const handleSessionChange = () => {
      const newSessionStr = localStorage.getItem("aeromiles_session");
      if (newSessionStr) {
        const newSession = JSON.parse(newSessionStr);
        setAwardMiles(newSession.award_miles || 0);
      }
    };

    window.addEventListener("SESSION_CHANGED_EVENT", handleSessionChange);
    return () => {
      window.removeEventListener("SESSION_CHANGED_EVENT", handleSessionChange);
    };
  }, [router]);

  if (!hydrated || !session) {
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

  const userRedeemHistory = redeemHistory.filter(
    (r) => r.email_member === session.email
  );

  const handleRedeem = (item: Hadiah) => {
    // Re-validate
    if (awardMiles < item.miles) {
      alert("❌ Award miles tidak cukup untuk redeem hadiah ini.");
      return;
    }
    if (!isValidToday(item.valid_start_date, item.program_end)) {
      alert("❌ Hadiah ini sudah tidak tersedia lagi.");
      return;
    }

    setSelectedHadiah(item);
    setShowModal(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedHadiah) return;

    // Deduct miles
    const newAwardMiles = awardMiles - selectedHadiah.miles;

    // Update session
    const updatedSession: SessionData = {
      ...session,
      award_miles: newAwardMiles,
    };
    localStorage.setItem("aeromiles_session", JSON.stringify(updatedSession));

    // Update aeromiles_users
    const users = getFromStorage("aeromiles_users");
    const userIndex = users.findIndex(
      (u: any) => u.email === session.email
    );
    if (userIndex !== -1) {
      users[userIndex].award_miles = Math.max(0, newAwardMiles);
      saveToStorage("aeromiles_users", users);
    }

    // Append to aeromiles_redeem
    const redeems = getFromStorage<Redeem>("aeromiles_redeem");
    redeems.push({
      email_member: session.email,
      kode_hadiah: selectedHadiah.kode_hadiah,
      nama_hadiah: selectedHadiah.nama,
      miles_used: selectedHadiah.miles,
      timestamp: new Date().toISOString(),
    });
    saveToStorage("aeromiles_redeem", redeems);

    // Update local state
    setAwardMiles(newAwardMiles);
    setRedeemHistory(redeems);
    setShowModal(false);
    setSelectedHadiah(null);

    // Emit session change
    window.dispatchEvent(new Event("SESSION_CHANGED_EVENT"));

    alert(`✅ Redeem berhasil! ${selectedHadiah.miles} miles telah dipotong.`);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Redeem Hadiah</h1>
        <p className="mb-8 text-gray-600">
          Tukarkan award miles kamu dengan hadiah menarik
        </p>

        {/* Tab Buttons */}
        <div className="mb-8 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("katalog")}
            className={`pb-3 font-semibold transition-colors ${
              activeTab === "katalog"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Katalog Hadiah
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`pb-3 font-semibold transition-colors ${
              activeTab === "riwayat"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Riwayat Redeem
          </button>
        </div>

        {/* VIEW 1: Katalog Hadiah */}
        {activeTab === "katalog" && (
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
                        {item.deskripsi.length > 100 && (
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
                        Redeem
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Riwayat Redeem */}
        {activeTab === "riwayat" && (
          <div className="rounded-lg bg-white shadow overflow-x-auto">
            {userRedeemHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                Kamu belum melakukan redeem hadiah.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      #
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Detail Hadiah
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Miles Digunakan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userRedeemHistory
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )
                    .map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          <p className="font-semibold">{item.nama_hadiah}</p>
                          <p className="text-xs text-gray-500">
                            {item.kode_hadiah}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(item.timestamp).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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

      {/* Confirmation Modal */}
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
        confirmLabel="Redeem"
        confirmVariant="primary"
      />
    </main>
  );
}
