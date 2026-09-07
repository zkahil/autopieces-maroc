import { Role } from "@prisma/client";

// Matrice des permissions par rôle — 4 rôles par défaut
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Manager / Chef de dépôt",
  VENDEUR: "Vendeur / Facturation",
  MAGASINIER: "Magasinier / Stock",
};

export const PERMISSIONS = {
  ADMIN: {
    users: true,
    parts: true,
    stock: true,
    invoices: true,
    clients: true,
    suppliers: true,
    reports: true,
    settings: true,
  },
  MANAGER: {
    users: false,
    parts: true,
    stock: true,
    invoices: true,
    clients: true,
    suppliers: true,
    reports: true,
    settings: false,
  },
  VENDEUR: {
    users: false,
    parts: false,
    stock: false,
    invoices: true,
    clients: true,
    suppliers: false,
    reports: false,
    settings: false,
  },
  MAGASINIER: {
    users: false,
    parts: true,
    stock: true,
    invoices: false,
    clients: false,
    suppliers: true,
    reports: false,
    settings: false,
  },
} as const;

export function can(role: Role, action: keyof (typeof PERMISSIONS)["ADMIN"]) {
  return PERMISSIONS[role][action];
}
