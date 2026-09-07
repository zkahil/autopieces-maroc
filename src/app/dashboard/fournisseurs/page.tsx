import { prisma } from "@/lib/prisma";
import FournisseursClient from "./FournisseursClient";

export default async function FournisseursPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { parts: true } } },
  });
  return <FournisseursClient suppliers={suppliers} />;
}
