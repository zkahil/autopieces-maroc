"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-2xl bg-odoo-danger/10 p-4 text-odoo-danger">
        <AlertTriangle size={28} />
      </div>
      <h2 className="mb-1 text-lg font-semibold text-gray-800">Une erreur est survenue</h2>
      <p className="mb-4 max-w-md text-sm text-gray-500">{error.message || "Erreur inattendue."}</p>
      <button onClick={reset} className="btn-primary">
        Réessayer
      </button>
    </div>
  );
}
