import Link from "next/link";
import { Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-odoo-bg px-4 text-center">
      <div className="mb-4 rounded-2xl bg-odoo-primary p-4">
        <Wrench className="text-white" size={32} />
      </div>
      <h1 className="mb-2 text-4xl font-bold text-gray-800">404</h1>
      <p className="mb-6 text-gray-500">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/dashboard" className="btn-primary">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
