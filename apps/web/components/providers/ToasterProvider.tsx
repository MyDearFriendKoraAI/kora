'use client';

import { Toaster } from 'sonner';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          fontSize: '14px',
        },
        className: 'font-sans',
      }}
    />
  );
}