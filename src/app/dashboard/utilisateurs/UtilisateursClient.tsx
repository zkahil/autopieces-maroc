"use client";
import { useState, useTransition } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { Role } from "@prisma/client";
import { createUser, updateUser, deleteUser, toggleUserActive } from "@/lib/actions";
import { ROLE_LABELS } from "@/lib/permissions";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  avatarUrl: string | null;
};

export default function UtilisateursClient({ users }: { users: User[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    setShowForm(true);
  }

  async function handleDelete(u: User) {
    if (!confirm(`Supprimer l'utilisateur "${u.name}" ?`)) return;
    try {
      await deleteUser(u.id);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{users.length} utilisateur(s) — 4 rôles disponibles</p>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Utilisateur</th>
              <th className="th">Email</th>
              <th className="th">Rôle</th>
              <th className="th">Statut</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="group">
                <td className="td flex items-center gap-2">
                  <img
                    src={u.avatarUrl || ""}
                    className="h-7 w-7 rounded-full object-cover"
                    alt={u.name}
                  />
                  {u.name}
                </td>
                <td className="td">{u.email}</td>
                <td className="td">
                  <span className="badge bg-odoo-primary/10 text-odoo-primary">
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="td">
                  <button
                    disabled={isPending}
                    onClick={() => startTransition(() => toggleUserActive(u.id, !u.active))}
                    className={`badge ${u.active ? "bg-odoo-success/10 text-odoo-success" : "bg-gray-100 text-gray-500"}`}
                  >
                    {u.active ? "Actif" : "Désactivé"}
                  </button>
                </td>
                <td className="td">
                  <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(u)}
                      className="text-gray-400 hover:text-odoo-primary"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      className="text-gray-400 hover:text-odoo-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
              {editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h2>
            <form
              action={async (fd) => {
                if (editing) {
                  fd.set("id", editing.id);
                  await updateUser(fd);
                } else {
                  await createUser(fd);
                }
                setShowForm(false);
              }}
              className="space-y-3"
            >
              <input
                name="name"
                placeholder="Nom complet"
                required
                defaultValue={editing?.name}
                className="input"
              />
              <input
                name="email"
                placeholder="Email"
                type="email"
                required
                defaultValue={editing?.email}
                className="input"
              />
              <input
                name="password"
                placeholder={
                  editing
                    ? "Nouveau mot de passe (laisser vide pour ne pas changer)"
                    : "Mot de passe"
                }
                type="password"
                required={!editing}
                className="input"
              />
              <select name="role" required defaultValue={editing?.role} className="input">
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <button className="btn-primary w-full" type="submit">
                {editing ? "Enregistrer" : "Créer le compte"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
