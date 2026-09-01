import type { MetadataRoute } from 'next';

// NOTE: These robots rules do NOT provide access control.
// They only request that crawlers do not index this page.
// Anyone with the URL can still access the dashboard.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
