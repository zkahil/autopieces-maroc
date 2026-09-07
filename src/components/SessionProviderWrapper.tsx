// components/SessionProviderWrapper.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SessionProviderWrapper({  // ✅ Export par défaut
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <SessionProvider>{children}</SessionProvider>;
}