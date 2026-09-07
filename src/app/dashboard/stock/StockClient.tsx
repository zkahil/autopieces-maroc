"use client";
import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";
import { createStockMovement, deleteStockMovement } from "@/lib/actions";

type Part = { id: string; name: string; reference: string; quantity: number };
type Movement = {
  id: string;
  type: "ENTREE" | "SORTIE";
  quantity: number;
  reason: string | null;
  createdAt: Date;
  part: { name: string };
  user: { name: string };
};

export default function StockClient({
  parts,
  movements,
}: {
  parts: Part[];
  movements: Movement[];
}) {
  const [type, setType] = useState<"ENTREE" | "SORTIE">("ENTREE");
  const [error, setError] = useState("");

  async function handleDeleteMovement(m: Movement) {
    if (!confirm("Annuler et supprimer ce mouvement ? Le stock sera recalculé en conséquence."))
      return;
    try {
      await deleteStockMovement(m.id);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="card h-fit lg:col-span-1">
        <h2 className="mb-4 font-semibold text-gray-800">Nouveau mouvement</h2>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setType("ENTREE")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium ${
              type === "ENTREE"
                ? "border-odoo-success bg-odoo-success/10 text-odoo-success"
                : "border-gray-200 text-gray-500"
            }`}
          >
            <ArrowDownCircle size={16} /> Entrée
          </button>
          <button
            onClick={() => setType("SORTIE")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium ${
              type === "SORTIE"
                ? "border-odoo-danger bg-odoo-danger/10 text-odoo-danger"
                : "border-gray-200 text-gray-500"
            }`}
          >
            <ArrowUpCircle size={16} /> Sortie
          </button>
        </div>
        <form
          action={async (fd) => {
            setError("");
            try {
              await createStockMovement(fd);
            } catch (e: any) {
              setError(e.message || "Erreur");
            }
          }}
          className="space-y-3"
        >
          <input type="hidden" name="type" value={type} />
          <div>
            <label className="text-xs text-gray-500">Pièce</label>
            <select name="partId" required className="input mt-1">
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.reference} — {p.name} (stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Quantité</label>
            <input name="quantity" type="number" min={1} required className="input mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Motif</label>
            <input
              name="reason"
              placeholder="Ex: réception fournisseur, casse, retour client..."
              className="input mt-1"
            />
          </div>
          {error && <p className="text-sm text-odoo-danger">{error}</p>}
          <button className="btn-primary w-full" type="submit">
            Valider le mouvement
          </button>
        </form>
      </div>

      <div className="card lg:col-span-2">
        <h2 className="mb-4 font-semibold text-gray-800">Historique des mouvements</h2>
        <div className="max-h-[560px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="th">Pièce</th>
                <th className="th">Type</th>
                <th className="th">Qté</th>
                <th className="th">Motif</th>
                <th className="th">Par</th>
                <th className="th">Date</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="group">
                  <td className="td">{m.part.name}</td>
                  <td className="td">
                    <span
                      className={`badge ${m.type === "ENTREE" ? "bg-odoo-success/10 text-odoo-success" : "bg-odoo-danger/10 text-odoo-danger"}`}
                    >
                      {m.type === "ENTREE" ? "Entrée" : "Sortie"}
                    </span>
                  </td>
                  <td className="td">{m.quantity}</td>
                  <td className="td text-gray-400">{m.reason || "—"}</td>
                  <td className="td">{m.user.name}</td>
                  <td className="td whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="td">
                    <button
                      title="Supprimer / annuler ce mouvement"
                      onClick={() => handleDeleteMovement(m)}
                      className="text-gray-300 opacity-0 transition-opacity hover:text-odoo-danger group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
