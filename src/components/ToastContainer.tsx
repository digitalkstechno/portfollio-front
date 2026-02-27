import React from "react";
import { useToast } from "@/context/ToastContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const colorFor = (type: "success" | "error" | "info") => {
    if (type === "success") return "bg-green-600";
    if (type === "error") return "bg-red-600";
    return "bg-gray-800";
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-64 max-w-96 text-white rounded-lg shadow-lg px-4 py-3 transition-all duration-300 ${colorFor(
            t.type
          )} pointer-events-auto`}
          role="status"
          onClick={() => removeToast(t.id)}
        >
          <div className="text-sm font-semibold">{t.message}</div>
        </div>
      ))}
    </div>
  );
}
