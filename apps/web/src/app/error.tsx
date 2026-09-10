'use client';
import React from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">System Error</h1>
      <p className="text-slate-600 mb-8">An unexpected error occurred in the platform.</p>
      <button onClick={() => reset()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
        Retry Operation
      </button>
    </div>
  );
}
