import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * CharacterAvatar — portrait qui "regarde" le curseur.
 *
 * Fonctionnement :
 * - 64 frames WebP réelles (extraites de la vidéo source avec ffmpeg, voir
 *   scripts/extract-frames), couvrant une rotation continue de la tête à
 *   ~5.6° d'écart chacune, + une frame center.webp (regard caméra neutre).
 * - Aucun <video> n'est lu/seeké au runtime (trop de lag / gel sur un MP4
 *   généré à 1 seul keyframe) : uniquement des <img> préchargées dessinées
 *   sur un <canvas>.
 * - Le corps/la page ne bougent jamais : ni perspective, ni rotateX/Y nulle
 *   part. Seule l'image affichée dans le canvas change.
 * - Un seul frame net dessiné à 100% d'opacité par tick (pas de fondu entre
 *   deux frames = pas de "double visage").
 * - Zone morte au centre : quand le curseur est proche du portrait, elle
 *   regarde droit dans les yeux (center.webp) plutôt que de trembler entre
 *   deux frames voisines.
 * - Désactivé sur les écrans tactiles (pas de curseur persistant) : affiche
 *   simplement le portrait neutre, sans canvas ni écouteurs.
 */

const FRAME_COUNT = 64;
const ANGLE_OFFSET = 45; // bucket 0 (f00.webp) correspond à ~45° (haut-droite)
const STEP = 360 / FRAME_COUNT; // ~5.625°
const RESPONSE = 0.26; // facteur de lerp angulaire (réactif, ~35ms pour rattraper)
const DEADZONE_RATIO = 0.12; // 12% de la plus petite dimension de l'écran

function angleToBucket(theta: number) {
  const rel = (((theta - ANGLE_OFFSET) % 360) + 360) % 360;
  return Math.round(rel / STEP) % FRAME_COUNT;
}

function lerpAngle(current: number, target: number, t: number) {
  const diff = (((target - current + 540) % 360) - 180 + 360) % 360 - 180;
  return (current + diff * t + 360) % 360;
}

export function CharacterAvatar({
  size,
  className = "",
}: {
  /** Taille fixe en px. Si omis, s'adapte automatiquement (96px mobile / 152px desktop). */
  size?: number;
  className?: string;
}) {
  const isMobile = useIsMobile();
  const resolvedSize = size ?? (isMobile ? 130 : 200);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const centerImgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [trackable, setTrackable] = useState(false);

  // Précharge les 65 WebP une seule fois
  useEffect(() => {
    let cancelled = false;
    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    Promise.all([
      Promise.all(
        Array.from({ length: FRAME_COUNT }, (_, i) =>
          load(`/frames/f${String(i).padStart(2, "0")}.webp`),
        ),
      ),
      load("/frames/center.webp"),
    ])
      .then(([frames, center]) => {
        if (cancelled) return;
        imagesRef.current = frames;
        centerImgRef.current = center;
        setReady(true);
      })
      .catch(() => {
        // en cas d'échec de chargement, on ne casse pas la page :
        // le portrait reste simplement absent.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Le suivi du curseur n'a de sens qu'avec un pointeur précis (souris/trackpad)
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setTrackable(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!ready || !trackable) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = resolvedSize * dpr;
    canvas.height = resolvedSize * dpr;
    ctx.scale(dpr, dpr);

    let centerRect = wrap.getBoundingClientRect();
    const refreshRect = () => {
      centerRect = wrap.getBoundingClientRect();
    };
    refreshRect();
    window.addEventListener("resize", refreshRect, { passive: true });
    window.addEventListener("scroll", refreshRect, { passive: true, capture: true });

    const mouse = { x: -9999, y: -9999, active: false };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });

    let currentAngle = ANGLE_OFFSET;
    let lastBucket = -2; // force le premier dessin
    let lastWasCenter = false;
    let raf = 0;

    const deadzone = () => DEADZONE_RATIO * Math.min(window.innerWidth, window.innerHeight);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const cx = centerRect.left + centerRect.width / 2;
      const cy = centerRect.top + centerRect.height / 2;
      const dx = mouse.x - cx;
      const dy = mouse.y - cy;
      const dist = Math.hypot(dx, dy);

      const inDeadzone = !mouse.active || dist < deadzone();

      if (inDeadzone) {
        if (!lastWasCenter) {
          const img = centerImgRef.current;
          if (img) {
            ctx.clearRect(0, 0, resolvedSize, resolvedSize);
            ctx.drawImage(img, 0, 0, resolvedSize, resolvedSize);
          }
          lastWasCenter = true;
          lastBucket = -1;
        }
        return;
      }

      lastWasCenter = false;
      const targetTheta = (Math.atan2(dx, -dy) * 180) / Math.PI;
      const targetAngle = ((targetTheta % 360) + 360) % 360;
      currentAngle = lerpAngle(currentAngle, targetAngle, RESPONSE);
      const bucket = angleToBucket(currentAngle);

      if (bucket !== lastBucket) {
        const img = imagesRef.current[bucket];
        if (img) {
          ctx.clearRect(0, 0, resolvedSize, resolvedSize);
          ctx.drawImage(img, 0, 0, resolvedSize, resolvedSize);
        }
        lastBucket = bucket;
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", refreshRect);
      window.removeEventListener("scroll", refreshRect, true);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [ready, trackable, resolvedSize]);

  const haloSize = resolvedSize;

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: haloSize, height: haloSize }}>
      {/* Halo d'ambiance : la même image, floutée et légèrement agrandie,
          posée derrière. Comme elle a la même transparence, le flou suit
          sa vraie silhouette au lieu de dessiner un cercle générique. */}
      <img
        src="/frames/center.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-contain opacity-70 blur-xl"
      />

      <div
        ref={wrapRef}
        aria-hidden
        className="absolute inset-0"
        style={{ width: resolvedSize, height: resolvedSize }}
      >
        {/* Portrait détouré (fond réellement transparent, contour naturel de
            la silhouette) : poster pendant le chargement, et rendu final sur
            mobile/tactile (pas de canvas superflu). */}
        <img
          src="/frames/center.webp"
          alt=""
          width={resolvedSize}
          height={resolvedSize}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${
            ready && trackable ? "opacity-0" : "opacity-100"
          }`}
          loading="eager"
          decoding="async"
        />
        {ready && trackable && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ width: resolvedSize, height: resolvedSize }}
          />
        )}
      </div>
    </div>
  );
}