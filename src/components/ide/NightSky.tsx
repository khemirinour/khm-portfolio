import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * macOS desktop wallpaper behind the VS Code window: a calm night sky
 * with small twinkling stars. Purely decorative and non-interactive.
 *
 * Perf mobile : la couche "star-field-near" (plus dense / plus animée) est
 * désactivée sur petit écran et pour les visiteurs qui ont demandé moins
 * d'animations (prefers-reduced-motion). Cela réduit nettement le nombre
 * d'éléments animés à faire tourner par le navigateur sur mobile.
 */
export function NightSky() {
  const isMobile = useIsMobile();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefersReducedMotion(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const reduceEffects = isMobile || prefersReducedMotion;

  return (
    <div aria-hidden className="desktop-night pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="star-field star-field-far absolute inset-[-20%]" />
      {!reduceEffects && ( <div className="star-field star-field-near absolute inset-[-20%]" /> )}
      <div className="moon-glow absolute right-[12%] top-[10%] size-40 rounded-full md:size-56" />
      <div className="horizon-haze absolute inset-x-0 bottom-0 h-1/3" />
    </div>
  );
}
