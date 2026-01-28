"use client";

import { useEffect, useState } from "react";

/**
 * Hook to check if the component is mounted on the client.
 * Useful for avoiding hydration mismatches with server-side rendering.
 *
 * @returns boolean indicating if the component is mounted
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMounted = useMounted();
 *
 *   if (!isMounted) {
 *     return null; // or a loading skeleton
 *   }
 *
 *   return <div>Client-only content</div>;
 * }
 * ```
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
