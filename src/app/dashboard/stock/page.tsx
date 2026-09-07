import { prisma } from "@/lib/prisma";
import StockClient from "./StockClient";

export default async function StockPage() {
  const [parts, movements] = await Promise.all([
    prisma.part.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, reference: true, quantity: true },
    }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { part: true, user: true },
    }),
  ]);
  return <StockClient parts={parts} movements={movements} />;
}
