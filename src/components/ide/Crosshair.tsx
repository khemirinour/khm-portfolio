import { useEffect, useState } from "react";

/**
 * Crosshair cursor overlay (inspired by aahanabobade.com):
 * two thin full-viewport guide lines following the pointer plus coordinates.
 */
export function Crosshair() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onLeave = () => setPos(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  if (!pos) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block">
      <div
        className="absolute left-0 w-full border-t border-dashed border-pink/40"
        style={{ top: pos.y }}
      />
      <div
        className="absolute top-0 h-full border-l border-dashed border-pink/40"
        style={{ left: pos.x }}
      />
      <div
        className="absolute size-4 -translate-x-1/2 -translate-y-1/2 border border-pink/70"
        style={{ left: pos.x, top: pos.y }}
      />
      <span
        className="absolute translate-x-4 translate-y-3 font-mono text-[10px] text-pink/70"
        style={{ left: pos.x, top: pos.y }}
      >
        {Math.round(pos.x)},{Math.round(pos.y)}
      </span>
    </div>
  );
}
