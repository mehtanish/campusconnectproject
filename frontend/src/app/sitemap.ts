import type { MetadataRoute } from 'next';

interface RouteConfig {
  path: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const PUBLIC_ROUTES: RouteConfig[] = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/complaints/new', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/complaints/upvoted', changeFrequency: 'daily', priority: 0.8 },
  { path: '/legal', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/login', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/register', changeFrequency: 'monthly', priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campusconnectproject-nu.vercel.app';
  const currentDate = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
