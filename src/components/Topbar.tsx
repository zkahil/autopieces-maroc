"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { ROLE_LABELS } from "@/lib/permissions";
import { Role } from "@prisma/client";

export default function Topbar({
  name,
  role,
  avatarUrl,
  title,
}: {
  name: string;
  role: Role;
  avatarUrl?: string | null;
  title: string;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/5 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium leading-tight text-gray-800">{name}</p>
          <p className="text-xs leading-tight text-gray-400">{ROLE_LABELS[role]}</p>
        </div>
        <img
          src={avatarUrl || `https://i.pravatar.cc/150?u=${name}`}
          alt={name}
          className="h-9 w-9 rounded-full border border-gray-200 object-cover"
        />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-gray-400 transition-colors hover:text-odoo-danger"
          title="Déconnexion"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
