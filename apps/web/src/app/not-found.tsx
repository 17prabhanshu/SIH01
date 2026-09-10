import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">404 - Not Found</h1>
      <p className="text-slate-600 mb-8">The requested intelligence resource could not be located.</p>
      <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
        Return to Command Centre
      </Link>
    </div>
  );
}
