'use client';

import React, { useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthProvider>
      <div suppressHydrationWarning>
        {children}
        {mounted && <Toaster position="top-right" theme="dark" richColors />}
      </div>
    </AuthProvider>
  );
}
