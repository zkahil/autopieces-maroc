// app/layout.tsx
import SessionProviderWrapper from '@/components/SessionProviderWrapper';  // ✅ Import par défaut
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

// ✅ Ajouter ceci pour éviter la génération statique
export const dynamic = 'force-dynamic';