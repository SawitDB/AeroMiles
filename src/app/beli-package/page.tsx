"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFromStorage, saveToStorage, updateMemberMiles } from "@/lib/storage";
import ConfirmModal from "@/components/ConfirmModal";

interface Package {
  id: string;
  jumlah_award_miles: number;
  harga_paket: number;
}

interface SessionData {
  email: string;
  role: string;
  award_miles: number;
}

interface Purchase {
  id_award_miles_package: string;
  email_member: string;
  timestamp: string;
}

export default function BeliPackagePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [awardMiles, setAwardMiles] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showModal, setShowModal] = useState(false);

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

    // Read packages
    const packagesData = getFromStorage<Package>("aeromiles_amp");
    setPackages(packagesData);
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

  const handleBeli = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedPackage || !session) return;

    // Update award_miles
    const newAwardMiles = awardMiles + selectedPackage.jumlah_award_miles;
    updateMemberMiles(session.email, selectedPackage.jumlah_award_miles, 0);

    // Append to aeromiles_member_amp
    const purchases = getFromStorage<Purchase>("aeromiles_member_amp");
    purchases.push({
      id_award_miles_package: selectedPackage.id,
      email_member: session.email,
      timestamp: new Date().toISOString(),
    });
    saveToStorage("aeromiles_member_amp", purchases);

    // Update local state
    setAwardMiles(newAwardMiles);
    setShowModal(false);
    setSelectedPackage(null);

    // Show toast (simple alert for now)
    alert(
      `✅ Pembelian berhasil! ${selectedPackage.jumlah_award_miles} miles telah ditambahkan.`
    );
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Beli Award Miles Package
        </h1>
        <p className="mb-8 text-gray-600">
          Tingkatkan award miles kamu dengan membeli package yang tersedia
        </p>

        {/* Award Miles Banner */}
        <div className="mb-8 rounded-lg bg-primary px-6 py-4 text-white">
          <p className="text-sm opacity-90">Award Miles Kamu Saat Ini</p>
          <p className="text-3xl font-bold">{awardMiles.toLocaleString("id-ID")}</p>
          <p className="mt-1 text-sm opacity-75">miles</p>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
            >
              <p className="mb-3 text-xs font-semibold text-gray-500">
                {pkg.id}
              </p>
              <p className="mb-2 text-3xl font-bold text-primary">
                {pkg.jumlah_award_miles.toLocaleString("id-ID")}
              </p>
              <p className="mb-4 text-sm text-gray-600">award miles</p>

              <p className="mb-6 text-lg font-semibold text-gray-900">
                {formatRupiah(pkg.harga_paket)}
              </p>

              <button
                onClick={() => handleBeli(pkg)}
                className="mt-auto rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                Beli
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showModal}
        title="Konfirmasi Pembelian"
        body={
          selectedPackage ? (
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-semibold">Paket:</span> {selectedPackage.id}
              </p>
              <p>
                <span className="font-semibold">Award Miles:</span>{" "}
                {selectedPackage.jumlah_award_miles.toLocaleString("id-ID")} miles
              </p>
              <p>
                <span className="font-semibold">Harga:</span>{" "}
                {formatRupiah(selectedPackage.harga_paket)}
              </p>
              <p className="border-t pt-3">
                <span className="font-semibold">Award Miles Setelah Pembelian:</span>{" "}
                <span className="text-primary font-bold">
                  {(awardMiles + selectedPackage.jumlah_award_miles).toLocaleString(
                    "id-ID"
                  )}
                </span>{" "}
                miles
              </p>
            </div>
          ) : null
        }
        onCancel={() => {
          setShowModal(false);
          setSelectedPackage(null);
        }}
        onConfirm={handleConfirmPurchase}
        confirmLabel="Konfirmasi Pembelian"
        confirmVariant="primary"
      />
    </main>
  );
}
