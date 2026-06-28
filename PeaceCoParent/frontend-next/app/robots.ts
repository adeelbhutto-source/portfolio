import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/compare', '/blog', '/register', '/login', '/terms', '/privacy'],
        disallow: [
          '/dashboard', '/messages', '/calendar', '/expenses',
          '/documents', '/court-report', '/children', '/coach',
          '/attorney', '/account', '/profile', '/setup',
          '/join/', '/auth/',
        ],
      },
    ],
    sitemap: 'https://peacecoparent.com/sitemap.xml',
  };
}
