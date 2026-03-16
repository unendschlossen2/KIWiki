/**
 * Resolves a path taking the base URL into account.
 * Prepends the import.meta.env.BASE_URL if it's available, otherwise uses the path as is.
 * Assumes the input path starts with a slash if it's meant to be absolute from domain root.
 */
export function resolvePath(path: string): string {
  const base = import.meta.env.BASE_URL;
  
  // If no base URL is configured, or it's just '/', return the path as is
  if (!base || base === '/') return path;
  
  // Clean up the base path (remove trailing slash)
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  
  // Clean up the path (remove leading slash if it exists to avoid double slashes)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // For root path exactly
  if (path === '/') return `${cleanBase}/`;
  
  return `${cleanBase}/${cleanPath}`;
}
