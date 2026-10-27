// Routes that need client JavaScript (CMS, ordering, tracking, dashboard); every other page stays script-free.
export const interactiveRoutes = [
  '/admin/',
  '/order/',
  '/en/order/',
  '/track/',
  '/en/track/',
  '/dashboard/',
];

export function isInteractivePath(path) {
  const normalized = `/${path.replace(/\\/gu, '/').replace(/^out\//u, '')}`;
  return interactiveRoutes.some((route) => normalized.startsWith(route));
}
