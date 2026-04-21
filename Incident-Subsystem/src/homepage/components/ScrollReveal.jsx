import { useEffect, useMemo, useRef, useState } from "react";

export default function ScrollReveal({
  as: Component = "div",
  children,
  className = "",
  style,
  delay = 0,
  distance = 18,
  duration = 620,
  threshold = 0.12,
  rootMargin = "0px 0px -10% 0px",
  scale = 1,
  once = true,
  staggerIndex = 0,
  staggerStep = 70,
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return undefined;
    }

    const node = elementRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(node);
          }
          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, prefersReducedMotion, rootMargin, threshold]);

  const revealStyle = useMemo(() => {
    if (prefersReducedMotion) {
      return style;
    }

    const computedDelay = delay + staggerIndex * staggerStep;

    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible
        ? "translate3d(0, 0, 0) scale(1)"
        : `translate3d(0, ${distance}px, 0) scale(${scale})`,
      transitionProperty: "opacity, transform",
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      transitionDelay: isVisible ? `${computedDelay}ms` : "0ms",
      willChange: "opacity, transform",
      backfaceVisibility: "hidden",
      ...style,
    };
  }, [
    delay,
    distance,
    duration,
    isVisible,
    prefersReducedMotion,
    scale,
    staggerIndex,
    staggerStep,
    style,
  ]);

  return (
    <Component ref={elementRef} className={className} style={revealStyle}>
      {children}
    </Component>
  );
}
