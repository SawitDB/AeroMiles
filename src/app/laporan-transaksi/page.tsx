"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getFromStorage, saveToStorage } from "@/lib/storage";
import ConfirmModal from "@/components/ConfirmModal";

interface Transaction {
  id: string;
  type: "Transfer" | "Redeem" | "Pembelian" | "Klaim";
  email_member: string;
  jumlah_miles: number;
  timestamp: string;
  source_key: string;
  source_index: number;
}

interface Member {
  email: string;
  nomor_member?: string;
  total_miles: number;
  role: string;
}

type Tab = "riwayat" | "topMember";
type TransactionTypeFilter = "all" | "Transfer" | "Redeem" | "Pembelian" | "Klaim";

export default function LaporanTransaksiPage() {
  const router = useRouter();
  const { user, isHydrated: authHydrated } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("riwayat");

  // Stats
  const [totalMilesBeredar, setTotalMilesBeredar] = useState(0);
  const [totalRedeemBulanIni, setTotalRedeemBulanIni] = useState(0);
  const [totalKlaimDisetujui, setTotalKlaimDisetujui] = useState(0);

  // Transactions
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [top5Members, setTop5Members] = useState<any[]>([]);
  const [top5Message, setTop5Message] = useState("");
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Initialize
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
    setSession({ email: user.email, role: user.role });

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

    // Load all data from storage (for riwayat)
    const users = getFromStorage<Member>("aeromiles_users");
    const transfers = getFromStorage("aeromiles_transfer");
    const redeems = getFromStorage("aeromiles_redeem");
    const memberAmps = getFromStorage("aeromiles_member_amp");
    const claims = getFromStorage("aeromiles_claim");

    setMembers(users);

    // Build unified transaction list
    const txns: Transaction[] = [];

    // Transfer transactions
    transfers.forEach((t: any, idx: number) => {
      txns.push({
        id: `transfer-${idx}`,
        type: "Transfer",
        email_member: t.email_member_1,
        jumlah_miles: -(t.jumlah || 0),
        timestamp: t.timestamp,
        source_key: "aeromiles_transfer",
        source_index: idx,
      });
    });

    // Redeem transactions
    redeems.forEach((r: any, idx: number) => {
      txns.push({
        id: `redeem-${idx}`,
        type: "Redeem",
        email_member: r.email_member,
        jumlah_miles: -(r.miles_used || 0),
        timestamp: r.timestamp,
        source_key: "aeromiles_redeem",
        source_index: idx,
      });
    });

    // Purchase transactions
    memberAmps.forEach((m: any, idx: number) => {
      txns.push({
        id: `pembelian-${idx}`,
        type: "Pembelian",
        email_member: m.email_member,
        jumlah_miles: m.jumlah_award_miles || 0,
        timestamp: m.timestamp,
        source_key: "aeromiles_member_amp",
        source_index: idx,
      });
    });

    // Claim transactions (only approved)
    claims.forEach((c: any, idx: number) => {
      if (c.status_penerimaan === "Disetujui") {
        txns.push({
          id: `klaim-${idx}`,
          type: "Klaim",
          email_member: c.email_member,
          jumlah_miles: c.jumlah_miles || 0,
          timestamp: c.timestamp,
          source_key: "aeromiles_claim",
          source_index: idx,
        });
      }
    });

    setAllTransactions(txns);

    // Calculate stats
    const totalMiles = users
      .filter((u) => u.role === "member")
      .reduce((sum, u) => sum + (u.total_miles || 0), 0);
    setTotalMilesBeredar(totalMiles);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const redeemThisMonth = redeems.filter((r: any) => {
      const rDate = new Date(r.timestamp);
      return rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear;
    }).length;
    setTotalRedeemBulanIni(redeemThisMonth);

    const approvedClaims = claims.filter(
      (c: any) => c.status_penerimaan === "Disetujui"
    ).length;
    setTotalKlaimDisetujui(approvedClaims);

    setHydrated(true);
  }, [authHydrated, user, router]);

  if (!hydrated || !session) {
    return null;
  }

  // Filter transactions
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
      const member = members.find((m) => m.email === txn.email_member);
      const searchText =
        txn.email_member.toLowerCase() +
        " " +
        (member?.nomor_member || "").toLowerCase();
      if (!searchText.includes(query)) return false;
    }

    return true;
  });

  const handleDeleteClick = (txn: Transaction) => {
    if (txn.type === "Klaim") {
      alert("❌ Tidak dapat menghapus riwayat Klaim yang sudah disetujui.");
      return;
    }
    setSelectedTransaction(txn);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedTransaction) return;

    const sourceKey = selectedTransaction.source_key;
    const index = selectedTransaction.source_index;

    // Load, modify, save
    const data = getFromStorage(sourceKey);
    data.splice(index, 1);
    saveToStorage(sourceKey, data);

    // Update local state
    setAllTransactions((prev) =>
      prev.filter((txn) => txn.id !== selectedTransaction.id)
    );

    setShowDeleteModal(false);
    setSelectedTransaction(null);
    alert("✅ Riwayat transaksi berhasil dihapus.");
  };

  const resetFilters = () => {
    setTypeFilter("all");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
  };

  // Top member ranking
  const topMembers = members
    .filter((m) => m.role === "member")
    .map((m) => {
      const memberTxns = allTransactions.filter(
        (txn) => txn.email_member === m.email
      );
      const txnCount = memberTxns.length;
      return {
        email: m.email,
        nomor_member: m.nomor_member || "-",
        total_miles: m.total_miles || 0,
        jumlah_transaksi: txnCount,
      };
    })
    .sort((a, b) => b.total_miles - a.total_miles);

  const medalMap: Record<number, string> = {
    0: "🥇",
    1: "🥈",
    2: "🥉",
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Laporan & Riwayat Transaksi
        </h1>
        <p className="mb-8 text-gray-600">
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
          {/* Tab Buttons */}
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
              {/* Filter Bar */}
              <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4 md:flex md:gap-3 md:space-y-0">
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

              {/* Table */}
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
                      {filteredTransactions
                        .sort(
                          (a, b) =>
                            new Date(b.timestamp).getTime() -
                            new Date(a.timestamp).getTime()
                        )
                        .map((txn) => (
                          <tr key={txn.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                                {txn.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              <p className="text-sm">{txn.email_member}</p>
                              <p className="text-xs text-gray-500">
                                {members.find((m) => m.email === txn.email_member)
                                  ?.nomor_member || "-"}
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
                            <td className="px-4 py-3 text-center">
                              {txn.type === "Klaim" ? (
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
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: Top Member */}
          {activeTab === "topMember" && (
            <div className="overflow-x-auto">
              {top5Message && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm font-semibold text-green-800 border border-green-200">
                  {top5Message}
                </div>
              )}
              {top5Members.length === 0 ? (
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
                        <td className="px-4 py-3 text-center font-bold text-lg">
                          {medalMap[idx] || idx + 1}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          <p className="text-sm font-semibold">{member.email}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-primary">
                          {member.total_miles.toLocaleString("id-ID")}
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

      {/* Delete Confirmation Modal */}
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
    </main>
  );
}
