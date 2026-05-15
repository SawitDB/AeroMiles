"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ConfirmModal from "@/components/ConfirmModal";

interface Transaction {
  type: "Transfer" | "Redeem" | "Pembelian" | "Klaim";
  email_member: string;
  nomor_member: string;
  jumlah_miles: number;
  timestamp: string;
  related: string;
  transfer_role?: "sender" | "receiver";
  delete_key: any;
}

interface TopMember {
  email: string;
  nomor_member: string;
  total_miles: number;
  jumlah_transaksi: number;
}

type Tab = "riwayat" | "topMember";
type TransactionTypeFilter = "all" | "Transfer" | "Redeem" | "Pembelian" | "Klaim";

export default function LaporanTransaksiPage() {
  const router = useRouter();
  const { user, isHydrated: authHydrated } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("riwayat");

  const [totalMilesBeredar, setTotalMilesBeredar] = useState(0);
  const [totalRedeemBulanIni, setTotalRedeemBulanIni] = useState(0);
  const [totalKlaimDisetujui, setTotalKlaimDisetujui] = useState(0);

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [top5Members, setTop5Members] = useState<any[]>([]);
  const [top5Message, setTop5Message] = useState("");

  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => {
    if (!authHydrated) return
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "staf") {
      router.replace("/dashboard");
      return;
    }

    // Load data from API for Top Members
    const fetchTopMembers = async () => {
      try {
        const res = await fetch("/api/laporan-transaksi?type=top-members");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTop5Members(data);
          setTop5Message(data[0].message);
        }
      } catch (err) {
        console.error("Failed to fetch top members", err);
      }
    };
    fetchTopMembers();

    (async () => {
      try {
        const [statsRes, txnRes, topRes] = await Promise.all([
          fetch("/api/laporan-transaksi?action=stats"),
          fetch("/api/laporan-transaksi?action=transactions"),
          fetch("/api/laporan-transaksi?action=top-member"),
        ]);

        if (statsRes.ok) {
          const stats = await statsRes.json();
          setTotalMilesBeredar(stats.total_miles_beredar);
          setTotalRedeemBulanIni(stats.total_redeem_bulan_ini);
          setTotalKlaimDisetujui(stats.total_klaim_disetujui);
        }

        if (txnRes.ok) {
          const data = await txnRes.json();
          setAllTransactions(data);
        }

        if (topRes.ok) {
          const data = await topRes.json();
          setTopMembers(data);
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

  const filteredTransactions = allTransactions.filter((txn) => {
    if (typeFilter !== "all" && txn.type !== typeFilter) return false;

    if (fromDate) {
      const fromD = new Date(fromDate);
      fromD.setHours(0, 0, 0, 0);
      const txnDate = new Date(txn.timestamp);
      txnDate.setHours(0, 0, 0, 0);
      if (txnDate < fromD) return false;
    }

    if (toDate) {
      const toD = new Date(toDate);
      toD.setHours(23, 59, 59, 999);
      if (new Date(txn.timestamp) > toD) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchText =
        txn.email_member.toLowerCase() +
        " " +
        (txn.nomor_member || "").toLowerCase();
      if (!searchText.includes(query)) return false;
    }

    return true;
  });

  const handleDeleteClick = (txn: Transaction) => {
    if (txn.type === "Klaim") {
      showNotification("error", "Tidak dapat menghapus riwayat Klaim yang sudah disetujui.");
      return;
    }
    setSelectedTransaction(txn);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return;

    try {
      const res = await fetch("/api/laporan-transaksi", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedTransaction.type,
          delete_key: selectedTransaction.delete_key,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        showNotification("error", `Gagal: ${result.error}`);
        return;
      }

      setAllTransactions((prev) =>
        selectedTransaction.type === "Transfer"
          ? prev.filter((t) => JSON.stringify(t.delete_key) !== JSON.stringify(selectedTransaction.delete_key))
          : prev.filter((t) => t !== selectedTransaction)
      );

      setShowDeleteModal(false);
      setSelectedTransaction(null);
      showNotification("success", "Riwayat transaksi berhasil dihapus.");
    } catch (error: any) {
      showNotification("error", `Gagal: ${error.message}`);
    }
  };

  const resetFilters = () => {
    setTypeFilter("all");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
  };

  const medalMap: Record<number, string> = {
    0: "🥇",
    1: "🥈",
    2: "🥉",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary-700 to-secondary-500 text-white px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold">
          Laporan & Riwayat Transaksi
        </h1>
        <p className="mb-8 ">
          Pantau semua transaksi member dan statistik bisnis
        </p>

        {/* SECTION 1: Stats Summary */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="mb-2 text-sm text-gray-600">Total Miles Beredar</p>
            <p className="text-3xl font-bold text-primary">
              {totalMilesBeredar.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="mb-2 text-sm text-gray-600">Total Redeem Bulan Ini</p>
            <p className="text-3xl font-bold text-secondary">
              {totalRedeemBulanIni}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="mb-2 text-sm text-gray-600">Total Klaim Disetujui</p>
            <p className="text-3xl font-bold text-green-600">
              {totalKlaimDisetujui}
            </p>
          </div>
        </div>

        {/* SECTION 2: Tabs */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6 flex gap-4 border-b">
            <button
              onClick={() => setActiveTab("riwayat")}
              className={`pb-3 font-semibold transition-colors ${
                activeTab === "riwayat"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Riwayat Transaksi
            </button>
            <button
              onClick={() => setActiveTab("topMember")}
              className={`pb-3 font-semibold transition-colors ${
                activeTab === "topMember"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Top Member
            </button>
          </div>

          {/* VIEW 1: Riwayat Transaksi */}
          {activeTab === "riwayat" && (
            <div>
              <div className="mb-6 space-y-3 rounded-lg text-black bg-gray-50 p-4 md:flex md:gap-3 md:space-y-0">
                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as TransactionTypeFilter)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Redeem">Redeem</option>
                  <option value="Pembelian">Pembelian</option>
                  <option value="Klaim">Klaim</option>
                </select>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Dari Tanggal"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Sampai Tanggal"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Member (email atau nomor member)"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <button
                  onClick={resetFilters}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Reset Filter
                </button>
              </div>

              <div className="overflow-x-auto">
                {filteredTransactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Tidak ada riwayat transaksi.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Tipe
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Member
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">
                          Jumlah Miles
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const sorted = [...filteredTransactions].sort(
                          (a, b) =>
                            new Date(b.timestamp).getTime() -
                            new Date(a.timestamp).getTime()
                        );
                        return sorted.map((txn, idx) => {
                          const prevTxn = idx > 0 ? sorted[idx - 1] : null;
                          const nextTxn = idx < sorted.length - 1 ? sorted[idx + 1] : null;

                          const isSecondTransferRow =
                            txn.type === "Transfer" &&
                            prevTxn?.type === "Transfer" &&
                            JSON.stringify(txn.delete_key) === JSON.stringify(prevTxn.delete_key);

                          const isFirstTransferRow =
                            txn.type === "Transfer" &&
                            nextTxn?.type === "Transfer" &&
                            JSON.stringify(txn.delete_key) === JSON.stringify(nextTxn.delete_key);

                          const tipeLabel =
                            txn.type === "Transfer" && txn.transfer_role === "receiver"
                              ? "Transfer (Terima)"
                              : txn.type === "Transfer" && txn.transfer_role === "sender"
                              ? "Transfer (Kirim)"
                              : txn.type;

                          return (
                            <tr key={`${txn.type}-${idx}`} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                                  {tipeLabel}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                <p className="text-sm">{txn.email_member}</p>
                                <p className="text-xs text-gray-500">
                                  {txn.nomor_member || "-"}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold">
                                <span
                                  className={
                                    txn.jumlah_miles >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {txn.jumlah_miles >= 0 ? "+" : ""}
                                  {txn.jumlah_miles.toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                {new Date(txn.timestamp).toLocaleDateString(
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
                              <td
                                className="px-4 py-3 text-center align-middle"
                                rowSpan={isFirstTransferRow ? 2 : undefined}
                              >
                                {isSecondTransferRow ? null : txn.type === "Klaim" ? (
                                  <span className="text-gray-400">🔒</span>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteClick(txn)}
                                    className="text-red-600 hover:text-red-800 font-semibold"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: Top Member */}
          {activeTab === "topMember" && (
            <div className="overflow-x-auto text-black">
              {topMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Tidak ada member.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        #
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        Member
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">
                        Total Miles
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {top5Members.map((member, idx) => (
                      <tr key={member.email} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-center font-bold text-lg text-black">
                          {medalMap[idx] || idx + 1}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          <p className="text-sm font-semibold">{member.email}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-primary">
                          {member.total_miles.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-black">
                          {member.jumlah_transaksi}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Hapus Riwayat Transaksi?"
        body="Penghapusan riwayat ini bersifat permanen dan tidak dapat dibatalkan. Tindakan ini akan memengaruhi tampilan yang dilihat oleh Member."
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleConfirmDelete}
        confirmLabel="Hapus"
        confirmVariant="danger"
      />

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
    </main>
  );
}
