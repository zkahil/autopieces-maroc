import { describe, it, expect } from "vitest";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { Role } from "@prisma/client";

describe("permissions", () => {
  it("l'administrateur a accès à tout", () => {
    expect(can(Role.ADMIN, "users")).toBe(true);
    expect(can(Role.ADMIN, "settings")).toBe(true);
  });

  it("le vendeur n'a accès ni au stock ni aux pièces", () => {
    expect(can(Role.VENDEUR, "stock")).toBe(false);
    expect(can(Role.VENDEUR, "parts")).toBe(false);
    expect(can(Role.VENDEUR, "invoices")).toBe(true);
  });

  it("le magasinier n'a pas accès à la facturation", () => {
    expect(can(Role.MAGASINIER, "invoices")).toBe(false);
    expect(can(Role.MAGASINIER, "stock")).toBe(true);
  });

  it("le manager n'a pas accès aux paramètres ni aux utilisateurs", () => {
    expect(can(Role.MANAGER, "settings")).toBe(false);
    expect(can(Role.MANAGER, "users")).toBe(false);
    expect(can(Role.MANAGER, "reports")).toBe(true);
  });

  it("chaque rôle a un libellé français", () => {
    for (const role of Object.values(Role)) {
      expect(ROLE_LABELS[role]).toBeTruthy();
    }
  });
});
