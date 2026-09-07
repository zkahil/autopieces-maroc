import { prisma } from "@/lib/prisma";
import FacturesClient from "./FacturesClient";

export default async function FacturesPage() {
  const [invoices, clients, parts] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, user: true, lines: { include: { part: true } } },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.part.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, reference: true, salePrice: true, quantity: true },
    }),
  ]);
  return <FacturesClient invoices={invoices} clients={clients} parts={parts} />;
}
