"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchRealPartPhoto } from "@/lib/images";
import { MovementType, InvoiceStatus, Role } from "@prisma/client";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non authentifié");
  return session.user;
}

function friendlyDeleteError(e: any, label: string): never {
  if (e?.code === "P2003" || e?.code === "P2014") {
    throw new Error(
      `Impossible de supprimer ${label} : des données liées existent encore (mouvements, factures...).`
    );
  }
  throw e;
}

// =========================================================
// PIÈCES — Create / Update / Delete
// =========================================================
function partFieldsFromForm(formData: FormData) {
  return {
    reference: String(formData.get("reference")),
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    purchasePrice: parseFloat(String(formData.get("purchasePrice"))),
    salePrice: parseFloat(String(formData.get("salePrice"))),
    quantity: parseInt(String(formData.get("quantity") || "0"), 10),
    minQuantity: parseInt(String(formData.get("minQuantity") || "5"), 10),
    brandId: String(formData.get("brandId")),
    categoryId: String(formData.get("categoryId")),
    supplierId: String(formData.get("supplierId") || "") || null,
  };
}

export async function createPart(formData: FormData) {
  await requireUser();
  const fields = partFieldsFromForm(formData);
  const manualImage = String(formData.get("imageUrl") || "").trim();
  const imageUrl = manualImage || (await fetchRealPartPhoto(fields.name));

  await prisma.part.create({ data: { ...fields, imageUrl } });
  revalidatePath("/dashboard/pieces");
  revalidatePath("/dashboard");
}

export async function updatePart(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id"));
  const fields = partFieldsFromForm(formData);
  const manualImage = String(formData.get("imageUrl") || "").trim();

  await prisma.part.update({
    where: { id },
    data: { ...fields, ...(manualImage ? { imageUrl: manualImage } : {}) },
  });
  revalidatePath("/dashboard/pieces");
  revalidatePath("/dashboard");
}

export async function refreshPartPhoto(id: string) {
  await requireUser();
  const part = await prisma.part.findUniqueOrThrow({ where: { id } });
  const imageUrl = await fetchRealPartPhoto(part.name);
  await prisma.part.update({ where: { id }, data: { imageUrl } });
  revalidatePath("/dashboard/pieces");
}

export async function deletePart(id: string) {
  await requireUser();
  try {
    await prisma.part.delete({ where: { id } });
  } catch (e) {
    friendlyDeleteError(e, "cette pièce");
  }
  revalidatePath("/dashboard/pieces");
  revalidatePath("/dashboard");
}

// =========================================================
// STOCK — Create / Delete (annule le mouvement)
// =========================================================
export async function createStockMovement(formData: FormData) {
  const user = await requireUser();
  const partId = String(formData.get("partId"));
  const type = String(formData.get("type")) as MovementType;
  const quantity = parseInt(String(formData.get("quantity")), 10);
  const reason = String(formData.get("reason") || "");

  const part = await prisma.part.findUniqueOrThrow({ where: { id: partId } });
  const newQty = type === "ENTREE" ? part.quantity + quantity : part.quantity - quantity;
  if (newQty < 0) throw new Error("Stock insuffisant pour cette sortie.");

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: { partId, type, quantity, reason, userId: user.id },
    }),
    prisma.part.update({ where: { id: partId }, data: { quantity: newQty } }),
  ]);
  revalidatePath("/dashboard/stock");
  revalidatePath("/dashboard/pieces");
  revalidatePath("/dashboard");
}

export async function deleteStockMovement(id: string) {
  await requireUser();
  const movement = await prisma.stockMovement.findUniqueOrThrow({ where: { id } });
  const part = await prisma.part.findUniqueOrThrow({ where: { id: movement.partId } });
  // Annule l'effet du mouvement sur le stock avant de le supprimer.
  const reversedQty =
    movement.type === "ENTREE"
      ? part.quantity - movement.quantity
      : part.quantity + movement.quantity;
  if (reversedQty < 0) throw new Error("Suppression impossible : le stock deviendrait négatif.");

  await prisma.$transaction([
    prisma.part.update({ where: { id: part.id }, data: { quantity: reversedQty } }),
    prisma.stockMovement.delete({ where: { id } }),
  ]);
  revalidatePath("/dashboard/stock");
  revalidatePath("/dashboard/pieces");
  revalidatePath("/dashboard");
}

// =========================================================
// CLIENTS — Create / Update / Delete
// =========================================================
function clientFieldsFromForm(formData: FormData) {
  return {
    name: String(formData.get("name")),
    phone: String(formData.get("phone") || "") || null,
    email: String(formData.get("email") || "") || null,
    ice: String(formData.get("ice") || "") || null,
    city: String(formData.get("city") || "") || null,
    address: String(formData.get("address") || "") || null,
  };
}

export async function createClient(formData: FormData) {
  await requireUser();
  await prisma.client.create({ data: clientFieldsFromForm(formData) });
  revalidatePath("/dashboard/clients");
}

export async function updateClient(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id"));
  await prisma.client.update({ where: { id }, data: clientFieldsFromForm(formData) });
  revalidatePath("/dashboard/clients");
}

export async function deleteClient(id: string) {
  await requireUser();
  try {
    await prisma.client.delete({ where: { id } });
  } catch (e) {
    friendlyDeleteError(e, "ce client");
  }
  revalidatePath("/dashboard/clients");
}

// =========================================================
// FOURNISSEURS — Create / Update / Delete
// =========================================================
function supplierFieldsFromForm(formData: FormData) {
  return {
    name: String(formData.get("name")),
    phone: String(formData.get("phone") || "") || null,
    email: String(formData.get("email") || "") || null,
    city: String(formData.get("city") || "") || null,
  };
}

export async function createSupplier(formData: FormData) {
  await requireUser();
  await prisma.supplier.create({ data: supplierFieldsFromForm(formData) });
  revalidatePath("/dashboard/fournisseurs");
}

export async function updateSupplier(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id"));
  await prisma.supplier.update({ where: { id }, data: supplierFieldsFromForm(formData) });
  revalidatePath("/dashboard/fournisseurs");
}

export async function deleteSupplier(id: string) {
  await requireUser();
  try {
    await prisma.supplier.delete({ where: { id } });
  } catch (e) {
    friendlyDeleteError(e, "ce fournisseur");
  }
  revalidatePath("/dashboard/fournisseurs");
}

// =========================================================
// UTILISATEURS (Admin) — Create / Update / Delete
// =========================================================
async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) throw new Error("Réservé à l'administrateur.");
  return user;
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email"));
  const password = await bcrypt.hash(String(formData.get("password")), 10);
  await prisma.user.create({
    data: {
      name: String(formData.get("name")),
      email,
      password,
      role: String(formData.get("role")) as Role,
      avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
    },
  });
  revalidatePath("/dashboard/utilisateurs");
}

export async function updateUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const newPassword = String(formData.get("password") || "");
  await prisma.user.update({
    where: { id },
    data: {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      role: String(formData.get("role")) as Role,
      ...(newPassword ? { password: await bcrypt.hash(newPassword, 10) } : {}),
    },
  });
  revalidatePath("/dashboard/utilisateurs");
}

export async function toggleUserActive(userId: string, active: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/dashboard/utilisateurs");
}

export async function deleteUser(id: string) {
  const admin = await requireAdmin();
  if (admin.id === id) throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  try {
    await prisma.user.delete({ where: { id } });
  } catch (e) {
    friendlyDeleteError(
      e,
      "cet utilisateur (des factures ou mouvements lui sont liés — désactivez-le plutôt)"
    );
  }
  revalidatePath("/dashboard/utilisateurs");
}

// =========================================================
// FACTURES — Create / Update statut / Delete
// =========================================================
export async function createInvoice(formData: FormData) {
  const user = await requireUser();
  const clientId = String(formData.get("clientId"));
  const partIds = formData.getAll("partId") as string[];
  const quantities = formData.getAll("quantity") as string[];
  const tva = parseFloat(String(formData.get("tva") || "20"));

  const lines = [];
  for (let i = 0; i < partIds.length; i++) {
    if (!partIds[i]) continue;
    const qty = parseInt(quantities[i] || "0", 10);
    if (qty <= 0) continue;
    const part = await prisma.part.findUniqueOrThrow({ where: { id: partIds[i] } });
    if (part.quantity < qty) throw new Error(`Stock insuffisant pour ${part.name}`);
    lines.push({
      partId: part.id,
      quantity: qty,
      unitPrice: part.salePrice,
      total: part.salePrice * qty,
    });
  }
  if (lines.length === 0) throw new Error("Ajoutez au moins une ligne de facture.");

  const totalHT = lines.reduce((s, l) => s + l.total, 0);
  const totalTTC = Math.round(totalHT * (1 + tva / 100) * 100) / 100;
  const count = await prisma.invoice.count();
  const number = `FA-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  await prisma.$transaction(async (tx) => {
    await tx.invoice.create({
      data: {
        number,
        clientId,
        userId: user.id,
        status: InvoiceStatus.VALIDEE,
        totalHT,
        tva,
        totalTTC,
        lines: { create: lines },
      },
    });
    for (const l of lines) {
      await tx.part.update({
        where: { id: l.partId },
        data: { quantity: { decrement: l.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          partId: l.partId,
          type: "SORTIE",
          quantity: l.quantity,
          reason: `Facture ${number}`,
          userId: user.id,
        },
      });
    }
  });

  revalidatePath("/dashboard/factures");
  revalidatePath("/dashboard/pieces");
  revalidatePath("/dashboard/stock");
  revalidatePath("/dashboard");
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const user = await requireUser();
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { lines: true },
  });

  // Annulation : on remet les pièces en stock si la facture n'était pas déjà annulée.
  if (status === InvoiceStatus.ANNULEE && invoice.status !== InvoiceStatus.ANNULEE) {
    await prisma.$transaction(async (tx) => {
      for (const l of invoice.lines) {
        await tx.part.update({
          where: { id: l.partId },
          data: { quantity: { increment: l.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            partId: l.partId,
            type: "ENTREE",
            quantity: l.quantity,
            reason: `Annulation facture ${invoice.number}`,
            userId: user.id,
          },
        });
      }
      await tx.invoice.update({ where: { id: invoiceId }, data: { status } });
    });
  } else {
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
  }

  revalidatePath("/dashboard/factures");
  revalidatePath("/dashboard/pieces");
  revalidatePath("/dashboard/stock");
  revalidatePath("/dashboard");
}

export async function deleteInvoice(invoiceId: string) {
  const user = await requireUser();
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { lines: true },
  });

  await prisma.$transaction(async (tx) => {
    // Restocke les pièces si la facture n'était pas déjà annulée avant suppression.
    if (invoice.status !== InvoiceStatus.ANNULEE) {
      for (const l of invoice.lines) {
        await tx.part.update({
          where: { id: l.partId },
          data: { quantity: { increment: l.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            partId: l.partId,
            type: "ENTREE",
            quantity: l.quantity,
            reason: `Suppression facture ${invoice.number}`,
            userId: user.id,
          },
        });
      }
    }
    await tx.invoiceLine.deleteMany({ where: { invoiceId } });
    await tx.invoice.delete({ where: { id: invoiceId } });
  });

  revalidatePath("/dashboard/factures");
  revalidatePath("/dashboard/pieces");
  revalidatePath("/dashboard/stock");
  revalidatePath("/dashboard");
}
