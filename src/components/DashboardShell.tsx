"use client";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const TITLES: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/dashboard/pieces": "Pièces détachées",
  "/dashboard/stock": "Entrées / Sorties de stock",
  "/dashboard/factures": "Facturation",
  "/dashboard/clients": "Clients",
  "/dashboard/fournisseurs": "Fournisseurs",
  "/dashboard/utilisateurs": "Utilisateurs",
};

export default function DashboardShell({
  role,
  name,
  avatarUrl,
  children,
}: {
  role: Role;
  name: string;
  avatarUrl?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = TITLES[pathname] || "AutoPièces Maroc";
  return (
    <div className="flex h-screen overflow-hidden bg-odoo-bg">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar name={name} role={role} avatarUrl={avatarUrl} title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
