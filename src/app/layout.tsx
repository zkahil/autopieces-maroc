// app/layout.tsx
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {/* ✅ Le provider ne sera chargé que côté client */}
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

// ✅ Ajouter ceci pour éviter la génération statique du layout
export const dynamic = 'force-dynamic';