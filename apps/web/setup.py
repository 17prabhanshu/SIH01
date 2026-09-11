import os

base_dir = "/Users/prabhanshushekhar/Downloads/xSIH101/apps/web"

files = {
    "package.json": """{
  "name": "ner-landslide-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.368.0",
    "maplibre-gl": "^4.1.2",
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.12.5",
    "tailwind-merge": "^2.2.2"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "@types/react": "^18.2.79",
    "@types/react-dom": "^18.2.25",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5"
  }
}
""",
    "tsconfig.json": """{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""",
    "tailwind.config.ts": """import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a365d",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        neutral: {
          DEFAULT: "#64748b",
          foreground: "#ffffff",
        },
        risk: {
          low: "#10b981",
          moderate: "#f59e0b",
          high: "#ef4444",
          extreme: "#7f1d1d",
        }
      },
    },
  },
  plugins: [],
};
export default config;
""",
    "postcss.config.js": """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
""",
    "next.config.ts": """import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
""",
    "src/app/layout.tsx": """import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NER Landslide Early Warning",
  description: "Government-grade Landslide Early Warning platform for North Eastern Region of India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50`}>
        {children}
      </body>
    </html>
  );
}
""",
    "src/app/globals.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 214.3 56% 23%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 214.3 56% 23%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
""",
    "src/app/page.tsx": """import React from 'react';
import NERMap from '@/components/map/NERMap';
import SystemStatus from '@/components/dashboard/SystemStatus';
import AlertFeed from '@/components/dashboard/AlertFeed';
import ModelAgreement from '@/components/dashboard/ModelAgreement';
import DataFreshness from '@/components/dashboard/DataFreshness';

export default function CommandCentre() {
  return (
    <div className="flex h-screen flex-col bg-slate-100 overflow-hidden">
      <header className="flex h-14 items-center justify-between bg-primary px-6 text-primary-foreground">
        <h1 className="text-lg font-semibold tracking-tight">NER Landslide Early Warning Command Centre</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          <span className="text-sm text-slate-300">{new Date().toISOString()}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 border-r bg-white p-4">
          <SystemStatus />
        </aside>
        
        <main className="flex-1 relative">
          <NERMap />
        </main>
        
        <aside className="w-96 flex-shrink-0 border-l bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 border-b">
            <AlertFeed />
          </div>
          <div className="h-1/3 p-4">
            <DataFreshness />
          </div>
        </aside>
      </div>
      
      <footer className="h-12 border-t bg-white flex items-center px-6">
        <ModelAgreement />
      </footer>
    </div>
  );
}
""",
    "src/app/risk/[zoneId]/page.tsx": """import React from 'react';
import EvidencePanel from '@/components/risk/EvidencePanel';

export default function RiskZonePage({ params }: { params: { zoneId: string } }) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Risk Zone Intelligence: {params.zoneId}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Risk Assessment</h2>
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
            <span>Awaiting data connection</span>
          </div>
          <p className="text-sm text-slate-500">
            Explainability: This area exhibits recent slope movement (Sentinel-1 InSAR) combined with high soil moisture following intense rainfall.
          </p>
        </div>
        <EvidencePanel />
      </div>
    </div>
  );
}
""",
    "src/app/alerts/page.tsx": """import React from 'react';

export default function AlertsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Alert Management</h1>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-500">Severity</th>
              <th className="px-6 py-3 font-medium text-slate-500">Location</th>
              <th className="px-6 py-3 font-medium text-slate-500">Timestamp</th>
              <th className="px-6 py-3 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                Awaiting data connection
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
""",
    "src/app/satellite/page.tsx": """import React from 'react';

export default function SatellitePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Satellite Intelligence</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-2">Sentinel-1 (SAR)</h2>
          <p className="text-sm text-slate-500">Awaiting data connection</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-2">Sentinel-2 (Optical)</h2>
          <p className="text-sm text-slate-500">Awaiting data connection</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border relative">
          <div className="absolute top-4 right-4 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">EXPERIMENTAL</div>
          <h2 className="text-lg font-semibold mb-2">PolSAR Research Layer</h2>
          <p className="text-sm text-slate-500">Awaiting data connection</p>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/reports/page.tsx": """import React from 'react';

export default function ReportsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Field Reports</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border text-center text-slate-500">
        Awaiting data connection
      </div>
    </div>
  );
}
""",
    "src/app/emergency/page.tsx": """import React from 'react';

export default function EmergencyPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Emergency Centre</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border text-center text-slate-500">
        Awaiting data connection
      </div>
    </div>
  );
}
""",
    "src/app/system/page.tsx": """import React from 'react';

export default function SystemPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Status</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border text-center text-slate-500">
        Awaiting data connection
      </div>
    </div>
  );
}
""",
    "src/components/map/NERMap.tsx": """'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function NERMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;
    
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [92.0, 25.5],
        zoom: 6,
        attributionControl: true,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
    }
  }, []);

  return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
}
""",
    "src/components/dashboard/SystemStatus.tsx": """import React from 'react';

export default function SystemStatus() {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">System Status</h2>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Model Server</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-300"></span>
            Awaiting
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Database</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-300"></span>
            Awaiting
          </span>
        </div>
      </div>
    </div>
  );
}
""",
    "src/components/dashboard/AlertFeed.tsx": """import React from 'react';

export default function AlertFeed() {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Active Alerts</h2>
      <div className="text-sm text-slate-500 text-center py-8">
        Awaiting data connection
      </div>
    </div>
  );
}
""",
    "src/components/dashboard/ModelAgreement.tsx": """import React from 'react';

export default function ModelAgreement() {
  return (
    <div className="w-full flex items-center justify-between text-sm">
      <div className="font-semibold text-slate-700">Model Agreement</div>
      <div className="text-slate-500">Awaiting data connection</div>
    </div>
  );
}
""",
    "src/components/dashboard/DataFreshness.tsx": """import React from 'react';

export default function DataFreshness() {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Data Freshness</h2>
      <div className="text-sm text-slate-500">
        Awaiting data connection
      </div>
    </div>
  );
}
""",
    "src/components/risk/EvidencePanel.tsx": """import React from 'react';

export default function EvidencePanel() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">Model Evidence</h2>
      <div className="text-sm text-slate-500 text-center py-8">
        Awaiting data connection
      </div>
    </div>
  );
}
""",
    "src/lib/api.ts": """const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
""",
    "src/lib/types.ts": """export interface RiskAssessment {
  id: string;
  zone_id: string;
  timestamp: string;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  probability: number;
}

export interface SystemStatus {
  service: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'UNAVAILABLE';
  last_sync: string;
  latency_ms: number;
}
""",
    "src/app/not-found.tsx": """import React from 'react';
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
""",
    "src/app/error.tsx": """'use client';
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
""",
    "src/app/robots.ts": """import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
""",
    "src/app/sitemap.ts": """import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'http://localhost:3000',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
  ];
}
""",
    "src/app/manifest.ts": """import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NER Landslide Early Warning',
    short_name: 'NER LEW',
    description: 'Government-grade Landslide Early Warning platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a365d',
    icons: [],
  };
}
"""
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

with open(os.path.join(base_dir, "public", "favicon.ico"), "wb") as f:
    f.write(b"")

print("Files created successfully.")
