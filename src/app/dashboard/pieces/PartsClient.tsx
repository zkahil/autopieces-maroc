"use client";
import { useMemo, useState, useTransition } from "react";
import { Plus, Search, X, Pencil, Trash2, RefreshCw } from "lucide-react";
import { createPart, updatePart, deletePart, refreshPartPhoto } from "@/lib/actions";

type Part = {
  id: string;
  reference: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  minQuantity: number;
  brand: { id: string; name: string; logoUrl: string };
  category: { id: string; name: string };
  supplier: { id: string; name: string } | null;
};

type Ref = { id: string; name: string };

export default function PartsClient({
  parts,
  brands,
  categories,
  suppliers,
  canManage,
}: {
  parts: Part[];
  brands: { id: string; name: string; logoUrl: string }[];
  categories: Ref[];
  suppliers: Ref[];
  canManage: boolean;
}) {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [editing, setEditing] = useState<Part | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return parts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.reference.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = !brandFilter || p.brand.id === brandFilter;
      return matchesSearch && matchesBrand;
    });
  }, [parts, search, brandFilter]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(p: Part) {
    setEditing(p);
    setShowForm(true);
  }

  async function handleDelete(p: Part) {
    if (!confirm(`Supprimer la pièce "${p.name}" ? Cette action est irréversible.`)) return;
    try {
      await deletePart(p.id);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              className="input pl-9"
              placeholder="Rechercher une pièce ou référence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input max-w-[180px]"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        {canManage && (
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> Nouvelle pièce
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <div key={p.id} className="card group flex flex-col overflow-hidden p-0">
            <div className="relative h-32 bg-gray-100">
              <img src={p.imageUrl || ""} alt={p.name} className="h-full w-full object-cover" />
              <img
                src={p.brand.logoUrl}
                alt={p.brand.name}
                className="absolute bottom-2 right-2 h-8 w-8 rounded-md bg-white object-contain p-1 shadow"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
              {canManage && (
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    title="Recharger une photo réelle"
                    onClick={() => startTransition(() => refreshPartPhoto(p.id))}
                    className="rounded-md bg-white/90 p-1.5 text-gray-600 shadow hover:bg-white"
                  >
                    <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
                  </button>
                  <button
                    title="Modifier"
                    onClick={() => openEdit(p)}
                    className="rounded-md bg-white/90 p-1.5 text-gray-600 shadow hover:bg-white"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    title="Supprimer"
                    onClick={() => handleDelete(p)}
                    className="rounded-md bg-white/90 p-1.5 text-odoo-danger shadow hover:bg-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <p className="text-xs text-gray-400">
                {p.reference} · {p.category.name}
              </p>
              <p className="text-sm font-medium leading-snug text-gray-800">{p.name}</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="font-bold text-odoo-primary">{p.salePrice.toFixed(2)} DH</span>
                <span
                  className={`badge ${p.quantity <= p.minQuantity ? "bg-odoo-danger/10 text-odoo-danger" : "bg-odoo-success/10 text-odoo-success"}`}
                >
                  Stock : {p.quantity}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-gray-400">Aucune pièce trouvée.</p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="mb-4 text-lg font-semibold">
              {editing ? "Modifier la pièce" : "Ajouter une pièce"}
            </h2>
            <form
              action={async (fd) => {
                if (editing) {
                  fd.set("id", editing.id);
                  await updatePart(fd);
                } else {
                  await createPart(fd);
                }
                setShowForm(false);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Référence</label>
                  <input
                    name="reference"
                    required
                    defaultValue={editing?.reference}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Nom</label>
                  <input name="name" required defaultValue={editing?.name} className="input mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <input
                  name="description"
                  defaultValue={editing?.description || ""}
                  className="input mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Marque</label>
                  <select
                    name="brandId"
                    required
                    defaultValue={editing?.brand.id}
                    className="input mt-1"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Catégorie</label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editing?.category.id}
                    className="input mt-1"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Fournisseur</label>
                <select
                  name="supplierId"
                  defaultValue={editing?.supplier?.id || ""}
                  className="input mt-1"
                >
                  <option value="">—</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Achat (DH)</label>
                  <input
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editing?.purchasePrice}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Vente (DH)</label>
                  <input
                    name="salePrice"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editing?.salePrice}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Qté</label>
                  <input
                    name="quantity"
                    type="number"
                    defaultValue={editing?.quantity ?? 0}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Seuil min</label>
                  <input
                    name="minQuantity"
                    type="number"
                    defaultValue={editing?.minQuantity ?? 5}
                    className="input mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  URL photo réelle (optionnel — sinon récupérée automatiquement)
                </label>
                <input
                  name="imageUrl"
                  placeholder="https://... (laisser vide pour recherche automatique)"
                  className="input mt-1"
                />
              </div>
              <button className="btn-primary mt-2 w-full" type="submit">
                {editing ? "Enregistrer les modifications" : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
