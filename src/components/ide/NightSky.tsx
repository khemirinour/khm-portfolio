import { useEffect, useState } from "react";

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
  const [reduceEffects, setReduceEffects] = useState(false);

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceEffects(mqMobile.matches || mqMotion.matches);
    update();
    mqMobile.addEventListener("change", update);
    mqMotion.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqMotion.removeEventListener("change", update);
    };
  }, []);

  return (
    <div aria-hidden className="desktop-night pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="star-field star-field-far absolute inset-[-20%]" />
      {!reduceEffects && (
        <div className="star-field star-field-near absolute inset-[-20%]" />
      )}
      <div className="moon-glow absolute right-[12%] top-[10%] size-40 rounded-full md:size-56" />
      <div className="horizon-haze absolute inset-x-0 bottom-0 h-1/3" />
    </div>
  );
}
