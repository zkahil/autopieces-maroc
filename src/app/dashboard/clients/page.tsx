import { prisma } from "@/lib/prisma";
import ClientsClient from "./ClientsClient";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { invoices: true } } },
  }); // select: * by default already includes address
  return <ClientsClient clients={clients} />;
}
