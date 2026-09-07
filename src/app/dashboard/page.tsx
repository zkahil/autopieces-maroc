import { prisma } from "@/lib/prisma";
import { Package, AlertTriangle, FileText, TrendingUp } from "lucide-react";
import StockChart from "@/components/StockChart";

export default async function DashboardPage() {
  const [partsCount, invoicesThisMonth, revenueAgg, movements, byBrand] = await Promise.all([
    prisma.part.count(),
    prisma.invoice.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    prisma.invoice.aggregate({ _sum: { totalTTC: true } }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { part: true, user: true },
    }),
    prisma.carBrand.findMany({ include: { _count: { select: { parts: true } } } }),
  ]);

  const allParts = await prisma.part.findMany();
  const lowStockParts = allParts.filter((p) => p.quantity <= p.minQuantity);

  const chartData = byBrand
    .map((b) => ({ name: b.name, pieces: b._count.parts }))
    .filter((b) => b.pieces > 0)
    .sort((a, b) => b.pieces - a.pieces);

  const cards = [
    { label: "Pièces en catalogue", value: partsCount, icon: Package, color: "bg-odoo-primary" },
    {
      label: "Stock bas / rupture",
      value: lowStockParts.length,
      icon: AlertTriangle,
      color: "bg-odoo-warning",
    },
    {
      label: "Factures ce mois-ci",
      value: invoicesThisMonth,
      icon: FileText,
      color: "bg-odoo-secondary",
    },
    {
      label: "Chiffre d'affaires total",
      value: `${(revenueAgg._sum.totalTTC || 0).toFixed(2)} DH`,
      icon: TrendingUp,
      color: "bg-odoo-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4">
            <div className={`${c.color} rounded-xl p-3 text-white`}>
              <c.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{c.label}</p>
              <p className="text-xl font-bold text-gray-800">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-semibold text-gray-800">Répartition du catalogue par marque</h2>
          <StockChart data={chartData} />
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-800">Alertes stock bas</h2>
          <div className="max-h-72 space-y-3 overflow-y-auto">
            {lowStockParts.length === 0 && (
              <p className="text-sm text-gray-400">Aucune alerte 🎉</p>
            )}
            {lowStockParts.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="mr-2 truncate text-gray-700">{p.name}</span>
                <span className="badge bg-odoo-danger/10 text-odoo-danger">
                  {p.quantity} restant(s)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold text-gray-800">Derniers mouvements de stock</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Pièce</th>
              <th className="th">Type</th>
              <th className="th">Quantité</th>
              <th className="th">Utilisateur</th>
              <th className="th">Date</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td className="td">{m.part.name}</td>
                <td className="td">
                  <span
                    className={`badge ${m.type === "ENTREE" ? "bg-odoo-success/10 text-odoo-success" : "bg-odoo-danger/10 text-odoo-danger"}`}
                  >
                    {m.type === "ENTREE" ? "Entrée" : "Sortie"}
                  </span>
                </td>
                <td className="td">{m.quantity}</td>
                <td className="td">{m.user.name}</td>
                <td className="td">{new Date(m.createdAt).toLocaleString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
