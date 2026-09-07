import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import UtilisateursClient from "./UtilisateursClient";

export default async function UtilisateursPage() {
  const session = await getServerSession(authOptions);
  if (!session || !can(session.user.role, "users")) redirect("/dashboard");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return <UtilisateursClient users={users} />;
}
