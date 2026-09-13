import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

type Step = {
  id: string;
  /** sélecteur CSS pointant vers un data-tour="..." posé sur l'élément réel */
  target: string;
  title: string;
  text: string;
};

const STEPS: Step[] = [
  {
    id: "explorer",
    target: '[data-tour="activity-explorer"]',
    title: "L'explorateur",
    text: "Cliquez sur cette icône pour afficher ou masquer la liste des fichiers du portfolio.",
  },
  {
    id: "sidebar-files",
    target: '[data-tour="sidebar-files"]',
    title: "Fichiers cliquables",
    text: "Chaque fichier correspond à une section (à propos, projets, compétences...). Cliquez sur un nom pour l'ouvrir.",
  },
  {
    id: "home-actions",
    target: '[data-tour="home-actions"]',
    title: "Boutons rapides",
    text: "Ces boutons ouvrent directement Expériences, Compétences ou Contact, et permettent aussi de télécharger le CV.",
  },
  {
    id: "tabs",
    target: '[data-tour="tabs"]',
    title: "Onglets",
    text: "Les fichiers ouverts s'affichent ici en onglets, comme dans un vrai éditeur. La croix les referme.",
  },
  {
    id: "terminal",
    target: '[data-tour="activity-terminal"]',
    title: "Terminal interactif",
    text: "Ouvrez un vrai petit terminal : tapez « help » pour la liste des commandes, ou « ls » pour lister les fichiers.",
  },
];

const STORAGE_KEY = "portfolio_tutorial_seen_v1";

export function shouldShowTutorial() {
  try {
    return !window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // stockage indisponible (navigation privée, etc.) : on ne bloque pas l'affichage
    return true;
  }
}

function markTutorialSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

export function Tutorial({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const locate = () => {
      const current = STEPS[step];
      const el = current ? document.querySelector(current.target) : null;
      if (!el) {
        // cible absente (ex : panneau masqué sur mobile) -> on avance automatiquement
        setStep((s) => {
          if (s < STEPS.length - 1) return s + 1;
          onOpenChange(false);
          markTutorialSeen();
          return s;
        });
        return;
      }
      setRect(el.getBoundingClientRect());
    };

    locate();
    const onViewportChange = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(locate);
    };
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, step, onOpenChange]);

  const finish = () => {
    markTutorialSeen();
    onOpenChange(false);
  };

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const tooltipWidth = 272;
  const tooltipHeight = 150;

  const tooltipTop = rect
    ? rect.bottom + 12 + tooltipHeight > window.innerHeight
      ? Math.max(12, rect.top - 12 - tooltipHeight)
      : rect.bottom + 12
    : window.innerHeight / 2 - tooltipHeight / 2;
  const tooltipLeft = rect
    ? Math.min(Math.max(12, rect.left), window.innerWidth - tooltipWidth - 12)
    : window.innerWidth / 2 - tooltipWidth / 2;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Visite guidée du portfolio"
    >
      {/* Voile sombre, cliquer dessus ferme la visite */}
      <button
        type="button"
        aria-label="Fermer la visite guidée"
        onClick={finish}
        className="absolute inset-0 cursor-default bg-background/60"
      />

      {/* Halo autour de l'élément mis en avant */}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-md ring-2 ring-pink transition-[top,left,width,height] duration-200"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      )}

      <div
        className="absolute z-[101] rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-2xl"
        style={{ top: tooltipTop, left: tooltipLeft, width: tooltipWidth }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-pink">
            <Sparkles className="size-3.5" /> Astuce {step + 1}/{STEPS.length}
          </span>
          <button
            type="button"
            onClick={finish}
            aria-label="Fermer"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-foreground">{current.title}</h3>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{current.text}</p>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-opacity disabled:opacity-30 hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" /> Précédent
          </button>
          <button
            type="button"
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
            className="flex items-center gap-1 rounded-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
          >
            {isLast ? "Terminer" : "Suivant"}
            {!isLast && <ChevronRight className="size-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
