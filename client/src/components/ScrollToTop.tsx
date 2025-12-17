import { useEffect } from "react";
import { useLocation } from "wouter";

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll the main window
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    
    // Also scroll any internal content containers that have overflow
    // This handles pages with their own scroll containers
    const scrollableContainers = document.querySelectorAll(
      'main[class*="overflow"], [data-scroll-container], .scroll-container'
    );
    scrollableContainers.forEach((container) => {
      container.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
    
    // Also reset document.documentElement and body scroll
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);

  return null;
}
