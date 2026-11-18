import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Plus,
  TerminalSquare,
  Trash2,
  X,
} from "lucide-react";
import { FileIcon } from "./FileIcon";
import { education, experiences, profile, skills } from "./data";

type Tone = "muted" | "error" | "ok";
type Line =
  | { kind: "text"; text: string; tone?: Tone }
  | { kind: "input"; text: string }
  | { kind: "files"; files: string[] };

const HELP = [
  "Commandes disponibles :",
  "  help            affiche cette aide",
  "  ls              liste les fichiers du portfolio",
  "  open <fichier>  ouvre un fichier dans l'éditeur",
  "  cat <fichier>   idem open",
  "  whoami          à propos de moi",
  "  skills          liste des compétences",
  "  git log         historique du parcours",
  "  npm run dev     lance le portfolio",
  "  contact         coordonnées",
  "  github | linkedin | cv",
  "  pwd | date | echo <texte>",
  "  clear           efface le terminal",
  "  exit            ferme le terminal",
];

const text = (t: string, tone?: Tone): Line =>
  tone ? { kind: "text", text: t, tone } : { kind: "text", text: t };

export function Terminal({
  files,
  onOpen,
  onClose,
  compact = false,
  queued,
}: {
  files: string[];
  onOpen: (f: string) => void;
  onClose: () => void;
  /** Réduit la hauteur du terminal (utile sur mobile pour laisser plus de place au contenu). */
  compact?: boolean;
  /** Commande envoyée depuis l'extérieur (Run & Debug, menus…) ; `id` change à chaque envoi. */
  queued?: { id: number; cmd: string } | undefined;
}) {
  const [tab, setTab] = useState<"terminal" | "problems" | "output">("terminal");
  const [tall, setTall] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    text(`Bienvenue dans le portfolio de ${profile.first} ${profile.last}.`, "ok"),
    text("Tapez « help » puis Entrée. Astuce : cliquez sur un fichier listé.", "muted"),
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const push = (...l: Line[]) => setLines((prev) => [...prev, ...l]);

  const openUrl = (url: string, label: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    push(text(`Ouverture de ${label}…`, "ok"));
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    push({ kind: "input", text: cmd });
    if (!cmd) return;
    setHistory((h) => [cmd, ...h]);
    setHIndex(-1);

    const [name = "", ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");
    const full = cmd.toLowerCase().replace(/\s+/g, " ");
    const resolve = (a: string) =>
      files.find((f) => f.toLowerCase() === a.toLowerCase()) ??
      files.find((f) => f.toLowerCase().startsWith(a.toLowerCase()));

    if (full.startsWith("git log")) {
      const log = [
        ...experiences.map((e) => `feat: ${e.company} — ${e.period}`),
        ...education.map((e) => `docs: ${e.degree} — ${e.period}`),
      ];
      push(...log.map((l, i) => text(`${(0xa1f3c2 + i * 40991).toString(16).slice(0, 7)}  ${l}`)));
      return;
    }
    if (full === "npm run dev" || full === "npm start" || full === "bun dev") {
      push(
        text("> portfolio@1.0.0 dev", "muted"),
        text("> vite dev", "muted"),
        text("  VITE ready in 312 ms", "ok"),
        text(`  ➜  Local:   ${window.location.origin}/`),
        text("  ➜  Ouverture de home.tsx…", "muted"),
      );
      onOpen("home.tsx");
      return;
    }

    switch (name.toLowerCase()) {
      case "help":
        push(...HELP.map((t) => text(t)));
        break;
      case "ls":
      case "dir":
        push({ kind: "files", files });
        break;
      case "open":
      case "cat":
      case "code": {
        if (!arg) return push(text(`${name}: nom de fichier manquant`, "error"));
        const f = resolve(arg);
        if (!f) return push(text(`${name}: ${arg} : fichier introuvable`, "error"));
        onOpen(f);
        push(text(`Ouverture de ${f} dans l'éditeur…`, "ok"));
        break;
      }
      case "whoami":
        push(text(`${profile.first} ${profile.last} — ${profile.location}`));
        break;
      case "skills":
        push(
          ...skills.map((sk) =>
            text(
              `• ${sk.category ?? sk.key} : ${sk.items.slice(0, 6).join(", ")}${sk.items.length > 6 ? "…" : ""}`,
            ),
          ),
        );
        break;
      case "contact":
      case "email":
        push(text(`✉  ${profile.email}`), text(`☎  ${profile.phone}`));
        onOpen("contact.css");
        break;
      case "github":
        openUrl(profile.github, "GitHub");
        break;
      case "linkedin":
        openUrl(profile.linkedin, "LinkedIn");
        break;
      case "cv":
        openUrl("/khemiri_nour_elwoujoud.pdf", "CV (PDF)");
        break;
      case "pwd":
        push(text("/home/nour/portfolio/src"));
        break;
      case "date":
        push(text(new Date().toLocaleString("fr-FR")));
        break;
      case "echo":
        push(text(arg));
        break;
      case "sudo":
        push(text("Bien essayé 😏 — permission refusée.", "error"));
        break;
      case "exit":
        onClose();
        break;
      case "clear":
      case "cls":
        setLines([]);
        break;
      default:
        push(text(`commande introuvable : ${name} (essayez « help »)`, "error"));
    }
  };

  // Commande reçue depuis l'extérieur (bouton Run, menu Terminal…)
  useEffect(() => {
    if (!queued) return;
    setTab("terminal");
    run(queued.cmd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queued?.id]);

  const tabs = [
    { key: "problems", label: "PROBLÈMES", cls: "hidden sm:flex" },
    { key: "output", label: "SORTIE", cls: "hidden sm:flex" },
    { key: "terminal", label: "TERMINAL", cls: "flex" },
  ] as const;

  const iconBtn = "rounded p-0.5 hover:bg-sidebar-active hover:text-foreground";

  return (
    <div
      className={`flex ${tall ? "h-[55%]" : compact ? "h-40" : "h-56"} shrink-0 flex-col border-t border-border bg-editor`}
      onClick={() => tab === "terminal" && inputRef.current?.focus()}
    >
      <div className="flex h-8 shrink-0 items-center gap-4 border-b border-border bg-chrome px-3 text-[11px] tracking-[0.15em] text-muted-foreground">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTab(t.key);
            }}
            className={`${t.cls} items-center gap-2 border-b-2 pb-1 pt-1 transition-colors ${
              tab === t.key
                ? "border-pink text-foreground"
                : "border-transparent hover:text-foreground"
            }`}
          >
            {t.key === "terminal" && <TerminalSquare className="size-3.5" />}
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            title="Nouveau terminal"
            aria-label="Nouveau terminal"
            onClick={() => {
              setTab("terminal");
              setLines([text("Nouveau terminal — tapez « help ».", "muted")]);
            }}
            className={iconBtn}
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            title="Tuer le terminal"
            aria-label="Tuer le terminal"
            onClick={onClose}
            className={iconBtn}
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            type="button"
            title={tall ? "Restaurer la taille du panneau" : "Agrandir le panneau"}
            aria-label={tall ? "Restaurer la taille du panneau" : "Agrandir le panneau"}
            onClick={() => setTall((t) => !t)}
            className={`${iconBtn} hidden sm:block`}
          >
            {tall ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
          </button>
          <button
            type="button"
            title="Fermer le panneau"
            aria-label="Fermer le terminal"
            onClick={onClose}
            className={iconBtn}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {tab === "problems" && (
        <div className="flex-1 px-3 py-2 text-[12px] text-muted-foreground">
          Aucun problème détecté dans l'espace de travail. ✨
        </div>
      )}

      {tab === "output" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-6 text-muted-foreground">
          <div>[info] Portfolio chargé — {files.length} fichiers indexés.</div>
          <div>[info] Thème : Nour Dark</div>
          <div>[info] Prettier prêt.</div>
        </div>
      )}

      <div
        className={`${tab === "terminal" ? "" : "hidden"} min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-6`}
      >
        {lines.map((l, i) => {
          if (l.kind === "input")
            return (
              <div key={i} className="flex gap-2">
                <span className="text-code-fn">nour@portfolio</span>
                <span className="text-code-key">~/src</span>
                <span className="text-pink">$</span>
                <span className="text-foreground/90">{l.text}</span>
              </div>
            );
          if (l.kind === "files")
            return (
              <div key={i} className="flex flex-wrap gap-x-4 gap-y-1 py-1">
                {l.files.map((f) => (
                  <button
                    key={f}
                    onClick={() => onOpen(f)}
                    className="inline-flex items-center gap-1.5 text-code-string hover:underline"
                  >
                    <FileIcon name={f} className="size-3.5" />
                    {f}
                  </button>
                ))}
              </div>
            );
          return (
            <div
              key={i}
              className={`whitespace-pre-wrap ${
                l.tone === "error"
                  ? "text-destructive"
                  : l.tone === "ok"
                    ? "text-code-comment"
                    : l.tone === "muted"
                      ? "text-muted-foreground"
                      : "text-foreground/85"
              }`}
            >
              {l.text}
            </div>
          );
        })}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue("");
          }}
          className="flex items-center gap-2"
        >
          <span className="text-code-fn">nour@portfolio</span>
          <span className="text-code-key">~/src</span>
          <ChevronRight className="size-3 text-pink" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" && history.length) {
                e.preventDefault();
                const n = Math.min(hIndex + 1, history.length - 1);
                setHIndex(n);
                setValue(history[n] ?? "");
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const n = hIndex - 1;
                setHIndex(n);
                setValue(n >= 0 ? (history[n] ?? "") : "");
              } else if (e.key === "Tab") {
                e.preventDefault();
                const parts = value.split(/\s+/);
                const last = parts[parts.length - 1] ?? "";
                const match = files.find((f) => f.startsWith(last));
                if (match && parts.length > 1) {
                  parts[parts.length - 1] = match;
                  setValue(parts.join(" "));
                }
              }
            }}
            spellCheck={false}
            aria-label="Ligne de commande"
            className="min-w-0 flex-1 bg-transparent text-foreground caret-transparent outline-none"
          />
          <span className="caret h-4" />
        </form>
        <div ref={endRef} />
      </div>
    </div>
  );
}
