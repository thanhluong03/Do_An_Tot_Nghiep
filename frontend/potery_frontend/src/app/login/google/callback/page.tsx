'use client';

import { useEffect } from 'react';

export default function GoogleCallbackProxy() {
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const qs = typeof window !== 'undefined' ? window.location.search : '';
    window.location.replace(`${base.replace(/\/+$/, '')}/login/google/callback${qs}`);
  }, []);

  return null;
}


