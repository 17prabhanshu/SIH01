import { MetadataRoute } from 'next';

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
