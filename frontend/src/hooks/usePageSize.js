import { useState, useEffect } from 'react';

const getPageSize = () => {
  const w = window.innerWidth;
  if (w < 640) return 8;
  if (w < 1024) return 12;
  return 20;
};

/**
 * Returns a responsive page size:
 *  - mobile  (< 640px)  → 8
 *  - tablet  (< 1024px) → 12
 *  - desktop            → 20
 * Updates automatically on window resize (debounced).
 */
export const usePageSize = () => {
  const [pageSize, setPageSize] = useState(getPageSize());

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setPageSize(getPageSize()), 200);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return pageSize;
};
