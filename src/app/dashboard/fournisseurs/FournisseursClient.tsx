"use client";
import { useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { createSupplier, updateSupplier, deleteSupplier } from "@/lib/actions";

type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  email?: string | null;
  city: string | null;
  _count: { parts: number };
};

export default function FournisseursClient({ suppliers }: { suppliers: Supplier[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(s: Supplier) {
    setEditing(s);
    setShowForm(true);
  }

  async function handleDelete(s: Supplier) {
    if (!confirm(`Supprimer le fournisseur "${s.name}" ?`)) return;
    try {
      await deleteSupplier(s.id);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{suppliers.length} fournisseur(s)</p>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> Nouveau fournisseur
        </button>
      </div>
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Nom</th>
              <th className="th">Ville</th>
              <th className="th">Téléphone</th>
              <th className="th">Pièces fournies</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="group">
                <td className="td font-medium">{s.name}</td>
                <td className="td">{s.city || "—"}</td>
                <td className="td">{s.phone || "—"}</td>
                <td className="td">{s._count.parts}</td>
                <td className="td">
                  <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-gray-400 hover:text-odoo-primary"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="text-gray-400 hover:text-odoo-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={5} className="td py-8 text-center text-gray-400">
                  Aucun fournisseur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6">
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 text-gray-400"
            >
              <X size={20} />
            </button>
            <h2 className="mb-4 text-lg font-semibold">
              {editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}
            </h2>
            <form
              action={async (fd) => {
                if (editing) {
                  fd.set("id", editing.id);
                  await updateSupplier(fd);
                } else {
                  await createSupplier(fd);
                }
                setShowForm(false);
              }}
              className="space-y-3"
            >
              <input
                name="name"
                placeholder="Nom du fournisseur"
                required
                defaultValue={editing?.name}
                className="input"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="phone"
                  placeholder="Téléphone"
                  defaultValue={editing?.phone || ""}
                  className="input"
                />
                <input
                  name="city"
                  placeholder="Ville"
                  defaultValue={editing?.city || ""}
                  className="input"
                />
              </div>
              <input
                name="email"
                placeholder="Email"
                type="email"
                defaultValue={editing?.email || ""}
                className="input"
              />
              <button className="btn-primary w-full" type="submit">
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
