"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import {
  LayoutDashboard,
  PackageSearch,
  ArrowLeftRight,
  FileText,
  Users,
  Truck,
  UserCog,
  Wrench,
} from "lucide-react";
import { can } from "@/lib/permissions";

const NAV = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, perm: null },
  {
    href: "/dashboard/pieces",
    label: "Pièces détachées",
    icon: PackageSearch,
    perm: "parts" as const,
  },
  {
    href: "/dashboard/stock",
    label: "Entrées / Sorties",
    icon: ArrowLeftRight,
    perm: "stock" as const,
  },
  { href: "/dashboard/factures", label: "Factures", icon: FileText, perm: "invoices" as const },
  { href: "/dashboard/clients", label: "Clients", icon: Users, perm: "clients" as const },
  {
    href: "/dashboard/fournisseurs",
    label: "Fournisseurs",
    icon: Truck,
    perm: "suppliers" as const,
  },
  { href: "/dashboard/utilisateurs", label: "Utilisateurs", icon: UserCog, perm: "users" as const },
];

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-odoo-sidebar text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <div className="rounded-xl bg-odoo-primary p-2">
          <Wrench size={20} />
        </div>
        <div>
          <p className="font-bold leading-tight">AutoPièces</p>
          <p className="text-xs leading-tight text-white/50">Maroc</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.filter((item) => item.perm === null || can(role, item.perm)).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-odoo-primary text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-4 py-4 text-xs text-white/40">
        Thème inspiré d&apos;Odoo 19 · v1.0
      </div>
    </aside>
  );
}
