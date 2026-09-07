"use client";
import { useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { createClient, updateClient, deleteClient } from "@/lib/actions";

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  ice: string | null;
  city: string | null;
  address?: string | null;
  _count: { invoices: number };
};

export default function ClientsClient({ clients }: { clients: Client[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(c: Client) {
    setEditing(c);
    setShowForm(true);
  }

  async function handleDelete(c: Client) {
    if (!confirm(`Supprimer le client "${c.name}" ?`)) return;
    try {
      await deleteClient(c.id);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{clients.length} client(s)</p>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> Nouveau client
        </button>
      </div>
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Nom</th>
              <th className="th">Ville</th>
              <th className="th">Téléphone</th>
              <th className="th">ICE</th>
              <th className="th">Factures</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="group">
                <td className="td font-medium">{c.name}</td>
                <td className="td">{c.city || "—"}</td>
                <td className="td">{c.phone || "—"}</td>
                <td className="td">{c.ice || "—"}</td>
                <td className="td">{c._count.invoices}</td>
                <td className="td">
                  <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-gray-400 hover:text-odoo-primary"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="text-gray-400 hover:text-odoo-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="td py-8 text-center text-gray-400">
                  Aucun client.
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
              {editing ? "Modifier le client" : "Nouveau client"}
            </h2>
            <form
              action={async (fd) => {
                if (editing) {
                  fd.set("id", editing.id);
                  await updateClient(fd);
                } else {
                  await createClient(fd);
                }
                setShowForm(false);
              }}
              className="space-y-3"
            >
              <input
                name="name"
                placeholder="Nom / Raison sociale"
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
              <input
                name="ice"
                placeholder="ICE (entreprise)"
                defaultValue={editing?.ice || ""}
                className="input"
              />
              <input
                name="address"
                placeholder="Adresse"
                defaultValue={editing?.address || ""}
                className="input"
              />
              <button className="btn-primary w-full" type="submit">
                {editing ? "Enregistrer" : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
