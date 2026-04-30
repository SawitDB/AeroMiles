"use client";

import { ReactNode } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  body: string | ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
}

export default function ConfirmModal({
  isOpen,
  title,
  body,
  onCancel,
  onConfirm,
  confirmLabel = "Konfirmasi",
  confirmVariant = "primary",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = confirmVariant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>

        <div className="mb-6 text-gray-700">{body}</div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2 font-medium text-white ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:bg-primary-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
