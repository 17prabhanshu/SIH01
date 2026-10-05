import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Agentverse',
    short_name: 'Agentverse',
    description: 'An intelligence and discovery platform for the agentic internet.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#10b981',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
