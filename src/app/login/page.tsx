"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Administrateur", email: "admin@autopieces.ma" },
  { role: "Manager", email: "manager@autopieces.ma" },
  { role: "Vendeur", email: "vendeur@autopieces.ma" },
  { role: "Magasinier", email: "stock@autopieces.ma" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@autopieces.ma");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-odoo-sidebar px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 rounded-2xl bg-odoo-primary p-3">
            <Wrench className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">AutoPièces Maroc</h1>
          <p className="text-sm text-white/60">
            Gestion de stock &amp; facturation — pièces automobiles
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-8 shadow-xl">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              className="input mt-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              className="input mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-odoo-danger">{error}</p>}
          <button
            disabled={loading}
            className="btn-primary flex w-full justify-center"
            type="submit"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <div className="border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs text-gray-400">
              Comptes de démonstration (mot de passe : Password123!) :
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  type="button"
                  key={a.email}
                  onClick={() => setEmail(a.email)}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-left text-xs hover:border-odoo-primary hover:bg-odoo-primary/5"
                >
                  <span className="block font-medium">{a.role}</span>
                  <span className="text-gray-400">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
