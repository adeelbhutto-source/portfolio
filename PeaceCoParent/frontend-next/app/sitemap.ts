import type { MetadataRoute } from 'next';

const BASE = 'https://peacecoparent.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,               lastModified: new Date('2026-05-12'), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/pricing`,  lastModified: new Date('2026-05-01'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/compare`,  lastModified: new Date('2026-05-01'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/register`, lastModified: new Date('2026-05-01'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/blog`,     lastModified: new Date('2026-05-07'), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/blog/peace-score-co-parenting-2026`,                lastModified: new Date('2026-05-01'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/blog/how-to-stop-fighting-with-co-parent-over-text`, lastModified: new Date('2026-05-07'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/co-parenting-communication-tips`,               lastModified: new Date('2026-05-07'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/how-to-document-co-parenting-for-court`,        lastModified: new Date('2026-05-07'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/ourfamilywizard-vs-peacecoparent`,              lastModified: new Date('2026-05-01'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/peace-score`, lastModified: new Date('2026-05-13'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/login`,    lastModified: new Date('2026-04-01'), changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${BASE}/privacy`,  lastModified: new Date('2026-04-01'), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,    lastModified: new Date('2026-04-01'), changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
