import { useEffect, useRef, useCallback } from 'react';

/**
 * useInfiniteScroll
 * @param {Function} callback - Function to call when bottom is reached
 * @param {Boolean} hasMore - Whether there's more to load
 * @param {Boolean} loading - Current loading state to prevent double triggers
 * @returns {Object} - { sentinelRef }
 */
export const useInfiniteScroll = (callback, hasMore, loading) => {
  const sentinelRef = useRef(null);

  const handleIntersect = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      callback();
    }
  }, [callback, hasMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '200px', // Trigger slightly before the end
      threshold: 0.1,
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [handleIntersect]);

  return { sentinelRef };
};
