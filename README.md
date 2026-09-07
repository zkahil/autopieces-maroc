# AutoPièces Maroc — Gestion de pièces détachées automobiles

Application de gestion complète (thème inspiré d'**Odoo 19**) pour un dépôt / magasin de pièces
détachées automobiles au Maroc : catalogue, entrées/sorties de stock, facturation, clients,
fournisseurs et gestion des utilisateurs avec **4 rôles**.

## Stack technique

- **Next.js 14** (App Router, Server Components + Server Actions)
- **TypeScript**, **Tailwind CSS** (palette inspirée d'Odoo)
- **Prisma ORM** + **Neon** (PostgreSQL serverless)
- **NextAuth.js** (authentification par identifiants, sessions JWT)
- **Recharts** pour les graphiques du tableau de bord
- Logos des marques automobiles chargés dynamiquement via l'API gratuite **Clearbit Logo**
  (`https://logo.clearbit.com/{domaine}`) — aucune clé requise
- **Vraies photos de pièces** (pas de placeholder aléatoire) via l'API publique et gratuite
  **Wikimedia Commons** — recherche automatique d'une photo réelle correspondant au nom de la
  pièce (ex. "Plaquettes de frein" → vraie photo de plaquettes de frein). Voir `src/lib/images.ts`.
  Une URL de photo peut aussi être collée manuellement, et un bouton "recharger" permet de
  retenter une recherche.
- Avatars utilisateurs via **Pravatar** — gratuit, sans clé
- **Génération de factures PDF** téléchargeables (mise en page professionnelle, via `pdf-lib`,
  générée à la volée côté serveur — aucun service tiers payant)

## Les 4 rôles par défaut

| Rôle               | Accès                                                    |
| ------------------ | -------------------------------------------------------- |
| **Administrateur** | Tout, y compris gestion des utilisateurs et paramètres   |
| **Manager**        | Pièces, stock, factures, clients, fournisseurs, rapports |
| **Vendeur**        | Facturation et clients uniquement                        |
| **Magasinier**     | Pièces et mouvements de stock uniquement                 |

La matrice complète est dans `src/lib/permissions.ts`.

## Comptes de démonstration (après le seed)

Mot de passe pour tous : `Password123!`

- admin@autopieces.ma
- manager@autopieces.ma
- vendeur@autopieces.ma
- stock@autopieces.ma

## 1. Créer la base de données Neon

1. Créez un compte gratuit sur [neon.tech](https://neon.tech) et un nouveau projet.
2. Copiez la **chaîne de connexion pooled** (`...-pooler...`) → `DATABASE_URL`.
3. Copiez la **chaîne de connexion directe** (sans `-pooler`) → `DIRECT_URL`.
4. Dupliquez `.env.example` en `.env` et collez ces deux valeurs.
5. Générez `NEXTAUTH_SECRET` avec : `openssl rand -base64 32`.

## 2. Installation locale

```bash
npm install
npm run db:push      # crée les tables dans Neon à partir du schéma Prisma
npm run db:seed       # insère les 4 utilisateurs, marques, catégories, pièces, clients, une facture
npm run dev
```

Ouvrez http://localhost:3000 — vous serez redirigé vers `/login`.

> Remarque environnement : dans certains environnements sandbox sans accès complet à
> internet, `prisma generate` peut échouer à télécharger le moteur binaire depuis
> `binaries.prisma.sh`. Cela ne se produit pas en local ni sur Vercel, qui ont un accès
> réseau normal.

## 3. Déploiement sur Vercel

1. Poussez ce projet sur un dépôt GitHub (ou GitLab/Bitbucket).
2. Sur [vercel.com](https://vercel.com), cliquez **Add New → Project** et importez le dépôt.
3. Dans **Environment Variables**, ajoutez :
   - `DATABASE_URL` (chaîne pooled Neon)
   - `DIRECT_URL` (chaîne directe Neon)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → l'URL Vercel finale, ex. `https://votre-projet.vercel.app`
4. Le build (`prisma generate && next build`) s'exécute automatiquement.
5. Une fois déployé, exécutez la création des tables et le seed **une fois** depuis votre
   machine locale (pointée sur la même base Neon) :
   ```bash
   npm run db:push
   npm run db:seed
   ```
   ou via `vercel env pull` + les mêmes commandes.

## Structure du projet

```
prisma/schema.prisma      Modèle de données (User, CarBrand, Category, Supplier,
                           Part, StockMovement, Client, Invoice, InvoiceLine)
prisma/seed.ts             Données de démonstration (marques marché marocain, pièces, factures)
src/lib/auth.ts            Configuration NextAuth (Credentials)
src/lib/permissions.ts     Matrice des permissions par rôle
src/lib/actions.ts         Server Actions (créations, mouvements de stock, factures)
src/app/login              Page de connexion
src/app/dashboard          Tableau de bord + pages (pièces, stock, factures, clients,
                           fournisseurs, utilisateurs) protégées par rôle
src/components             Sidebar, Topbar, graphiques, layout du tableau de bord
```

## Fonctionnalités clés

- **Catalogue de pièces** filtrable par marque/référence, avec logo de la marque et vraie photo
- **Entrées / sorties de stock** tracées avec motif, utilisateur et historique complet
- **Facturation** multi-lignes avec calcul automatique HT/TVA/TTC et décrément du stock
- **Alertes de stock bas** sur le tableau de bord
- **Gestion des utilisateurs** (réservée à l'Administrateur) avec activation/désactivation
- Marques automobiles ciblées **marché marocain** : Dacia, Renault, Peugeot, Citroën,
  Volkswagen, Hyundai, Toyota, Fiat, Ford, Kia, Mercedes-Benz, Opel, Suzuki, Nissan

## CRUD complet — chaque module

Toutes les entités disposent des 4 opérations (Créer / Lire / Modifier / Supprimer),
via des Server Actions dans `src/lib/actions.ts` :

| Module                   | Créer | Lire                   | Modifier                                                    | Supprimer                                |
| ------------------------ | ----- | ---------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| **Pièces**               | ✅    | ✅                     | ✅ (+ recharger la photo)                                   | ✅ (bloqué si mouvements/factures liés)  |
| **Stock (mouvements)**   | ✅    | ✅ (historique)        | — (immuable, par nature comptable)                          | ✅ (annule et recalcule le stock)        |
| **Factures**             | ✅    | ✅ (détail des lignes) | ✅ (changement de statut : Brouillon/Validée/Payée/Annulée) | ✅ (recrédite le stock si nécessaire)    |
| **Clients**              | ✅    | ✅                     | ✅                                                          | ✅ (bloqué si factures liées)            |
| **Fournisseurs**         | ✅    | ✅                     | ✅                                                          | ✅ (bloqué si pièces liées)              |
| **Utilisateurs** (Admin) | ✅    | ✅                     | ✅ (+ changement de mot de passe)                           | ✅ (impossible de se supprimer soi-même) |

Les suppressions qui casseraient l'intégrité des données (ex. supprimer une pièce déjà
facturée) renvoient un message d'erreur clair plutôt que de planter silencieusement.

## Téléchargement PDF des factures

Chaque facture peut être téléchargée en PDF (icône ⬇️ dans la liste ou le détail d'une
facture) via `GET /api/factures/[id]/pdf`. Le document est généré à la volée côté serveur
avec `pdf-lib` (en-tête AutoPièces Maroc, informations client, tableau des lignes,
totaux HT/TVA/TTC) — aucune dépendance externe payante, aucun appel à un service tiers.

## Outillage projet "complet"

- **Qualité de code** : ESLint (`npm run lint`, config `next/core-web-vitals`) et
  Prettier (`npm run format` / `format:check`, avec tri automatique des classes Tailwind)
- **Tests unitaires** : Vitest (`npm run test`) — voir `src/lib/__tests__/`
  (matrice de permissions, récupération de photos réelles)
- **Intégration continue** : `.github/workflows/ci.yml` — lint, format, génération Prisma,
  tests et build à chaque push/PR sur `main`
- **Robustesse** : pages `not-found.tsx` (404), `dashboard/error.tsx` (error boundary),
  `dashboard/loading.tsx` (état de chargement), route `/api/health` (vérifie la connexion
  à la base de données — utile pour un monitoring externe)
- **Sécurité** : en-têtes HTTP (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`) définis dans `vercel.json`, `robots.txt` interdisant l'indexation du
  back-office
- **Divers** : favicon généré dynamiquement (`src/app/icon.tsx`), `LICENSE` (MIT),
  `.nvmrc` (Node 20), Prisma Studio (`npm run db:studio`) pour explorer la base visuellement,
  `npm run db:migrate` pour des migrations versionnées (alternative à `db:push` en production)

> Remarque : dans un environnement sandbox sans accès complet à internet, `prisma generate`
> (et donc `npm run test` / `next build`) peut échouer faute de pouvoir télécharger le moteur
> binaire Prisma. Ceci ne se produit ni en local, ni sur GitHub Actions, ni sur Vercel, qui
> ont un accès réseau normal.
