"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface AosProviderProps {
  children?: React.ReactNode;
}

export default function AosProvider({ children }: AosProviderProps) {
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
      offset: 100,
      easing: "ease-out-cubic",
    });

    // Refresh AOS on dynamic content or route changes
    AOS.refresh();
  }, []);

  return <>{children}</>;
}
