import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/permissions";
import PartsClient from "./PartsClient";

export default async function PiecesPage() {
  const session = await getServerSession(authOptions);
  const [parts, brands, categories, suppliers] = await Promise.all([
    prisma.part.findMany({
      include: { brand: true, category: true, supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.carBrand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  const canManage = can(session!.user.role, "parts");

  return (
    <PartsClient
      parts={parts}
      brands={brands}
      categories={categories}
      suppliers={suppliers}
      canManage={canManage}
    />
  );
}
