"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ConfirmModal from "@/components/ConfirmModal";

interface Package {
  id: string;
  jumlah_award_miles: number;
  harga_paket: number;
}

export default function BeliPackagePage() {
  const router = useRouter();
  const { user, isHydrated: authHydrated, updateProfile } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [awardMiles, setAwardMiles] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showModal, setShowModal] = useState(false);
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
    if (user.role !== "member") {
      router.replace("/dashboard");
      return;
    }

    setAwardMiles(user.awardMiles || 0);

    async function fetchPackages() {
      try {
        const res = await fetch("/api/beli-package");
        if (res.ok) {
          const data = await res.json();
          setPackages(data);
        }
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      }
      setHydrated(true);
    }

    fetchPackages();
  }, [authHydrated, user, router]);

  if (!hydrated || !user) {
    return null;
  }

  const handleBeli = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage || !user) return;

    try {
      const res = await fetch("/api/beli-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_award_miles_package: selectedPackage.id,
          email_member: user.email,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        showNotification("error", `Gagal: ${result.error}`);
        return;
      }

      const newAwardMiles = result.data.award_miles;
      setAwardMiles(newAwardMiles);
      updateProfile({ awardMiles: newAwardMiles, idTier: result.data.new_tier });
      setShowModal(false);
      setSelectedPackage(null);

      const successMsg = result.data.notice || result.message;
      showNotification("success", successMsg);
    } catch (error: any) {
      showNotification("error", `Gagal: ${error.message}`);
    }
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
                <span className="font-semibold">Award Miles:</span> {" +"}
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
