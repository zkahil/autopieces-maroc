"use client";
import { useState, useTransition } from "react";
import { Plus, Trash2, X, Download } from "lucide-react";
import { createInvoice, updateInvoiceStatus, deleteInvoice } from "@/lib/actions";

type Part = { id: string; name: string; reference: string; salePrice: number; quantity: number };
type Client = { id: string; name: string };
type Invoice = {
  id: string;
  number: string;
  status: string;
  totalHT: number;
  totalTTC: number;
  tva: number;
  createdAt: Date;
  client: { name: string };
  user: { name: string };
  lines: {
    id: string;
    quantity: number;
    unitPrice: number;
    total: number;
    part: { name: string };
  }[];
};

const STATUS_LABEL: Record<string, string> = {
  BROUILLON: "Brouillon",
  VALIDEE: "Validée",
  PAYEE: "Payée",
  ANNULEE: "Annulée",
};
const STATUS_COLOR: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-600",
  VALIDEE: "bg-odoo-secondary/10 text-odoo-secondary",
  PAYEE: "bg-odoo-success/10 text-odoo-success",
  ANNULEE: "bg-odoo-danger/10 text-odoo-danger",
};

export default function FacturesClient({
  invoices,
  clients,
  parts,
}: {
  invoices: Invoice[];
  clients: Client[];
  parts: Part[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [rows, setRows] = useState([{ id: 0 }]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleStatusChange(inv: Invoice, status: string) {
    try {
      await updateInvoiceStatus(inv.id, status as any);
      setSelected(null);
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleDelete(inv: Invoice) {
    if (
      !confirm(
        `Supprimer la facture ${inv.number} ? Les pièces seront recréditées en stock si nécessaire.`
      )
    )
      return;
    try {
      await deleteInvoice(inv.id);
      setSelected(null);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{invoices.length} facture(s)</p>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nouvelle facture
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">N°</th>
              <th className="th">Client</th>
              <th className="th">Vendeur</th>
              <th className="th">Statut</th>
              <th className="th">Total TTC</th>
              <th className="th">Date</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="group hover:bg-gray-50">
                <td
                  className="td cursor-pointer font-medium text-odoo-primary"
                  onClick={() => setSelected(inv)}
                >
                  {inv.number}
                </td>
                <td className="td cursor-pointer" onClick={() => setSelected(inv)}>
                  {inv.client.name}
                </td>
                <td className="td cursor-pointer" onClick={() => setSelected(inv)}>
                  {inv.user.name}
                </td>
                <td className="td cursor-pointer" onClick={() => setSelected(inv)}>
                  <span className={`badge ${STATUS_COLOR[inv.status]}`}>
                    {STATUS_LABEL[inv.status]}
                  </span>
                </td>
                <td className="td cursor-pointer font-semibold" onClick={() => setSelected(inv)}>
                  {inv.totalTTC.toFixed(2)} DH
                </td>
                <td className="td cursor-pointer" onClick={() => setSelected(inv)}>
                  {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="td">
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <a
                      href={`/api/factures/${inv.id}/pdf`}
                      title="Télécharger le PDF"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-odoo-primary"
                    >
                      <Download size={15} />
                    </a>
                    <button
                      onClick={() => handleDelete(inv)}
                      className="text-gray-300 hover:text-odoo-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="td py-8 text-center text-gray-400">
                  Aucune facture.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="mb-1 text-lg font-semibold">Facture {selected.number}</h2>
            <p className="mb-4 text-sm text-gray-500">
              {selected.client.name} · {new Date(selected.createdAt).toLocaleDateString("fr-FR")}
            </p>
            <table className="mb-4 w-full">
              <thead>
                <tr>
                  <th className="th">Pièce</th>
                  <th className="th">Qté</th>
                  <th className="th">PU</th>
                  <th className="th">Total</th>
                </tr>
              </thead>
              <tbody>
                {selected.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="td">{l.part.name}</td>
                    <td className="td">{l.quantity}</td>
                    <td className="td">{l.unitPrice.toFixed(2)} DH</td>
                    <td className="td">{l.total.toFixed(2)} DH</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mb-4 space-y-1 text-right text-sm">
              <p>
                Total HT : <span className="font-medium">{selected.totalHT.toFixed(2)} DH</span>
              </p>
              <p>
                TVA ({selected.tva}%) :{" "}
                <span className="font-medium">
                  {(selected.totalTTC - selected.totalHT).toFixed(2)} DH
                </span>
              </p>
              <p className="text-lg font-bold text-odoo-primary">
                Total TTC : {selected.totalTTC.toFixed(2)} DH
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
              <select
                disabled={isPending}
                defaultValue={selected.status}
                onChange={(e) =>
                  startTransition(() => handleStatusChange(selected, e.target.value))
                }
                className="input flex-1"
              >
                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <a
                href={`/api/factures/${selected.id}/pdf`}
                title="Télécharger le PDF"
                className="btn-secondary flex shrink-0 items-center gap-2"
              >
                <Download size={16} /> PDF
              </a>
              <button
                onClick={() => handleDelete(selected)}
                title="Supprimer la facture"
                className="p-2 text-gray-400 hover:text-odoo-danger"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6">
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="mb-4 text-lg font-semibold">Nouvelle facture</h2>
            <form
              action={async (fd) => {
                setError("");
                try {
                  await createInvoice(fd);
                  setShowForm(false);
                  setRows([{ id: 0 }]);
                } catch (e: any) {
                  setError(e.message || "Erreur");
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs text-gray-500">Client</label>
                <select name="clientId" required className="input mt-1">
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Lignes de facture</label>
                {rows.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <select name="partId" className="input flex-1">
                      <option value="">— Choisir une pièce —</option>
                      {parts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.reference} — {p.name} ({p.salePrice.toFixed(2)} DH)
                        </option>
                      ))}
                    </select>
                    <input
                      name="quantity"
                      type="number"
                      min={1}
                      defaultValue={1}
                      className="input w-20"
                    />
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRows(rows.filter((row) => row.id !== r.id))}
                        className="text-gray-400 hover:text-odoo-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setRows([...rows, { id: rows.length + Math.random() }])}
                  className="flex items-center gap-1 text-sm text-odoo-primary"
                >
                  <Plus size={14} /> Ajouter une ligne
                </button>
              </div>
              <div>
                <label className="text-xs text-gray-500">TVA (%)</label>
                <input name="tva" type="number" defaultValue={20} className="input mt-1 w-24" />
              </div>
              {error && <p className="text-sm text-odoo-danger">{error}</p>}
              <button className="btn-primary mt-2 w-full" type="submit">
                Créer la facture
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
