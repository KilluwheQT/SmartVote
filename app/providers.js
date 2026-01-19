'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store';

export default function Providers({ children }) {
  const { theme, fontSize } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (fontSize === 'large') {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
  }, [theme, fontSize]);

  return <>{children}</>;
}
