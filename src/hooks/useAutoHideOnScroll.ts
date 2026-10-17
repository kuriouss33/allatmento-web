'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseAutoHideOnScrollOptions {
  /**
   * Minimum scroll distance (in pixels) in one direction before triggering hide/show.
   * Prevents micro-jitter from small finger movements.
   * Default: 12px
   */
  threshold?: number;

  /**
   * Distance from the top of the container (in pixels) within which the element is ALWAYS visible.
   * Default: 25px
   */
  topOffset?: number;

  /**
   * Initial visibility state.
   * Default: true
   */
  initialVisible?: boolean;
}

export function useAutoHideOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseAutoHideOnScrollOptions = {}
) {
  const { threshold = 12, topOffset = 25, initialVisible = true } = options;

  const [isVisible, setIsVisible] = useState<boolean>(initialVisible);
  const scrollRef = useRef<T | null>(null);
  const lastScrollTopRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(initialVisible);

  // Keep ref synchronized with state to prevent stale closures in event listeners
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const handleScrollPosition = useCallback(
    (currentScrollTop: number, maxScroll?: number) => {
      // Prevent negative values from iOS rubber-band overscroll
      const scrollTop = Math.max(0, currentScrollTop);

      // Always show if at or near the top
      if (scrollTop <= topOffset) {
        if (!isVisibleRef.current) {
          setIsVisible(true);
        }
        lastScrollTopRef.current = scrollTop;
        return;
      }

      // Ignore rubber-band bounce at the bottom of the page
      if (maxScroll !== undefined && scrollTop >= maxScroll - 10) {
        return;
      }

      const delta = scrollTop - lastScrollTopRef.current;

      // Ignore micro movements below the threshold
      if (Math.abs(delta) < threshold) {
        return;
      }

      if (delta > 0) {
        // Scrolling down -> Auto-hide
        if (isVisibleRef.current) {
          setIsVisible(false);
        }
      } else {
        // Scrolling up -> Reappear
        if (!isVisibleRef.current) {
          setIsVisible(true);
        }
      }

      lastScrollTopRef.current = scrollTop;
    },
    [threshold, topOffset]
  );

  // Attach passive scroll listener to the referenced container
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onElementScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      handleScrollPosition(el.scrollTop, maxScroll);
    };

    el.addEventListener('scroll', onElementScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onElementScroll);
    };
  }, [handleScrollPosition]);

  // Window scroll fallback in case layout scrolls window on large screens
  useEffect(() => {
    const onWindowScroll = () => {
      const windowScrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      handleScrollPosition(windowScrollTop, docHeight);
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onWindowScroll);
    };
  }, [handleScrollPosition]);

  // Helper callback for JSX onScroll={handleScroll}
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const target = e.currentTarget;
      const maxScroll = target.scrollHeight - target.clientHeight;
      handleScrollPosition(target.scrollTop, maxScroll);
    },
    [handleScrollPosition]
  );

  return {
    isVisible,
    setIsVisible,
    scrollRef,
    handleScroll,
  };
}
