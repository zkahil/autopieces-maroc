import { PrismaClient, Role, MovementType, InvoiceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { fetchRealPartPhoto } from "../src/lib/images";

const prisma = new PrismaClient();

// Marques les plus vendues sur le marché marocain — logos via l'API gratuite Clearbit
// (https://logo.clearbit.com/{domaine}) — aucune clé API requise.
const BRANDS = [
  { name: "Dacia", domain: "dacia.com" },
  { name: "Renault", domain: "renault.com" },
  { name: "Peugeot", domain: "peugeot.com" },
  { name: "Citroën", domain: "citroen.com" },
  { name: "Volkswagen", domain: "vw.com" },
  { name: "Hyundai", domain: "hyundai.com" },
  { name: "Toyota", domain: "toyota.com" },
  { name: "Fiat", domain: "fiat.com" },
  { name: "Ford", domain: "ford.com" },
  { name: "Kia", domain: "kia.com" },
  { name: "Mercedes-Benz", domain: "mercedes-benz.com" },
  { name: "Opel", domain: "opel.com" },
  { name: "Suzuki", domain: "suzuki.com" },
  { name: "Nissan", domain: "nissan.com" },
];

const CATEGORIES = [
  "Freinage",
  "Moteur",
  "Suspension",
  "Filtration",
  "Électricité",
  "Carrosserie",
  "Échappement",
  "Transmission",
  "Climatisation",
  "Éclairage",
];

const SUPPLIERS = [
  { name: "Auto Hall Pièces", city: "Casablanca", phone: "0522-000111" },
  { name: "CDM Distribution", city: "Casablanca", phone: "0522-000222" },
  { name: "Berma Maroc", city: "Tanger", phone: "0539-000333" },
  { name: "Fenie Brossette Auto", city: "Rabat", phone: "0537-000444" },
];

async function main() {
  console.log("→ Nettoyage...");
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.part.deleteMany();
  await prisma.client.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.carBrand.deleteMany();
  await prisma.user.deleteMany();

  console.log("→ Utilisateurs (4 rôles)...");
  const password = await bcrypt.hash("Password123!", 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Zakariaa Kahil",
        email: "admin@autopieces.ma",
        password,
        role: Role.ADMIN,
        avatarUrl: "https://i.pravatar.cc/150?u=admin@autopieces.ma",
      },
    }),
    prisma.user.create({
      data: {
        name: "Karim Manager",
        email: "manager@autopieces.ma",
        password,
        role: Role.MANAGER,
        avatarUrl: "https://i.pravatar.cc/150?u=manager@autopieces.ma",
      },
    }),
    prisma.user.create({
      data: {
        name: "Sanae Vendeuse",
        email: "vendeur@autopieces.ma",
        password,
        role: Role.VENDEUR,
        avatarUrl: "https://i.pravatar.cc/150?u=vendeur@autopieces.ma",
      },
    }),
    prisma.user.create({
      data: {
        name: "Youssef Magasinier",
        email: "stock@autopieces.ma",
        password,
        role: Role.MAGASINIER,
        avatarUrl: "https://i.pravatar.cc/150?u=stock@autopieces.ma",
      },
    }),
  ]);

  console.log("→ Marques automobiles...");
  const brands = await Promise.all(
    BRANDS.map((b) =>
      prisma.carBrand.create({
        data: { name: b.name, logoUrl: `https://logo.clearbit.com/${b.domain}` },
      })
    )
  );

  console.log("→ Catégories...");
  const categories = await Promise.all(
    CATEGORIES.map((c) => prisma.category.create({ data: { name: c } }))
  );

  console.log("→ Fournisseurs...");
  const suppliers = await Promise.all(SUPPLIERS.map((s) => prisma.supplier.create({ data: s })));

  console.log("→ Pièces détachées...");
  const partNames = [
    "Plaquettes de frein avant",
    "Disque de frein",
    "Filtre à huile",
    "Filtre à air",
    "Filtre habitacle",
    "Amortisseur avant",
    "Bougie d'allumage",
    "Courroie de distribution",
    "Batterie 60Ah",
    "Alternateur",
    "Radiateur moteur",
    "Pompe à eau",
    "Embrayage kit",
    "Rétroviseur électrique",
    "Phare avant droit",
    "Pare-choc avant",
    "Silencieux échappement",
    "Compresseur climatisation",
    "Capteur ABS",
    "Rotule de direction",
  ];
  const parts = [];
  for (let i = 0; i < partNames.length; i++) {
    const brand = brands[i % brands.length];
    const category = categories[i % categories.length];
    const supplier = suppliers[i % suppliers.length];
    const ref = `PC-${String(i + 1).padStart(4, "0")}`;
    const purchasePrice = Math.round((50 + Math.random() * 900) * 10) / 10;
    console.log(`  → photo réelle pour: ${partNames[i]}`);
   const imageUrl = await fetchRealPartPhoto({
  partName: partNames[i],
  brand: brands[Math.floor(Math.random() * brands.length)],
});
    const part = await prisma.part.create({
      data: {
        reference: ref,
        name: `${partNames[i]} — ${brand.name}`,
        description: `${partNames[i]} compatible ${brand.name}, qualité équivalente origine.`,
        imageUrl,
        purchasePrice,
        salePrice: Math.round(purchasePrice * 1.4 * 10) / 10,
        quantity: Math.floor(Math.random() * 60) + 2,
        minQuantity: 5,
        brandId: brand.id,
        categoryId: category.id,
        supplierId: supplier.id,
      },
    });
    parts.push(part);
  }

  console.log("→ Mouvements de stock initiaux (entrées)...");
  for (const part of parts) {
    await prisma.stockMovement.create({
      data: {
        type: MovementType.ENTREE,
        quantity: part.quantity,
        reason: "Stock initial",
        partId: part.id,
        userId: users[3].id, // magasinier
      },
    });
  }

  console.log("→ Clients...");
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "Garage Atlas",
        city: "Casablanca",
        phone: "0661-111111",
        ice: "001234567000045",
      },
    }),
    prisma.client.create({
      data: {
        name: "Auto Réparation Fès",
        city: "Fès",
        phone: "0662-222222",
        ice: "001234567000046",
      },
    }),
    prisma.client.create({
      data: { name: "Taxi Grand Confort", city: "Marrakech", phone: "0663-333333" },
    }),
    prisma.client.create({ data: { name: "Client comptoir", city: "Casablanca" } }),
  ]);

  console.log("→ Facture exemple...");
  const linesData = parts.slice(0, 3).map((p) => ({
    partId: p.id,
    quantity: 2,
    unitPrice: p.salePrice,
    total: p.salePrice * 2,
  }));
  const totalHT = linesData.reduce((s, l) => s + l.total, 0);
  const tva = 20;
  const totalTTC = Math.round(totalHT * (1 + tva / 100) * 100) / 100;

  await prisma.invoice.create({
    data: {
      number: "FA-2026-0001",
      clientId: clients[0].id,
      userId: users[2].id, // vendeur
      status: InvoiceStatus.VALIDEE,
      totalHT,
      tva,
      totalTTC,
      lines: { create: linesData },
    },
  });

  console.log("✔ Seed terminé.");
  console.log("Comptes de test (mot de passe: Password123!) :");
  console.log(
    " admin@autopieces.ma / manager@autopieces.ma / vendeur@autopieces.ma / stock@autopieces.ma"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
