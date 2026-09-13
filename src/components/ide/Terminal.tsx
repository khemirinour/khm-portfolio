import { useEffect, useRef, useState } from "react";
import { ChevronRight, TerminalSquare, X } from "lucide-react";
import { FileIcon } from "./FileIcon";
import { profile } from "./data";

type Line =
  | { kind: "text"; text: string; tone?: "muted" | "error" | "ok" }
  | { kind: "input"; text: string }
  | { kind: "files"; files: string[] };

const HELP = [
  "Commandes disponibles :",
  "  help            affiche cette aide",
  "  ls              liste les fichiers du portfolio",
  "  open <fichier>  ouvre un fichier dans l'éditeur",
  "  cat <fichier>   idem open",
  "  whoami          à propos de moi",
  "  pwd             répertoire courant",
  "  date            date du jour",
  "  clear           efface le terminal",
];

export function Terminal({
  files,
  onOpen,
  onClose,
  compact = false,
}: {
  files: string[];
  onOpen: (f: string) => void;
  onClose: () => void;
  /** Réduit la hauteur du terminal (utile sur mobile pour laisser plus de place au contenu). */
  compact?: boolean;
}) {
  const [lines, setLines] = useState<Line[]>([
    { kind: "text", text: `Bienvenue dans le portfolio de ${profile.first} ${profile.last}.`, tone: "ok" },
    { kind: "text", text: "Tapez « help » puis Entrée. Astuce : cliquez sur un fichier listé.", tone: "muted" },
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

  const run = (raw: string) => {
    const cmd = raw.trim();
    push({ kind: "input", text: cmd });
    if (!cmd) return;
    setHistory((h) => [cmd, ...h]);
    setHIndex(-1);

    const [name = "", ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");
    const resolve = (a: string) =>
      files.find((f) => f.toLowerCase() === a.toLowerCase()) ??
      files.find((f) => f.toLowerCase().startsWith(a.toLowerCase()));

    switch (name.toLowerCase()) {
      case "help":
        push(...HELP.map((t) => ({ kind: "text" as const, text: t })));
        break;
      case "ls":
      case "dir":
        push({ kind: "files", files });
        break;
      case "open":
      case "cat":
      case "code": {
        if (!arg) return push({ kind: "text", text: `${name}: nom de fichier manquant`, tone: "error" });
        const f = resolve(arg);
        if (!f) return push({ kind: "text", text: `${name}: ${arg} : fichier introuvable`, tone: "error" });
        onOpen(f);
        push({ kind: "text", text: `Ouverture de ${f} dans l'éditeur…`, tone: "ok" });
        break;
      }
      case "whoami":
        push({ kind: "text", text: `${profile.first} ${profile.last} — ${profile.location}` });
        break;
      case "pwd":
        push({ kind: "text", text: "/home/nour/portfolio/src" });
        break;
      case "date":
        push({ kind: "text", text: new Date().toLocaleString("fr-FR") });
        break;
      case "clear":
        setLines([]);
        break;
      default:
        push({ kind: "text", text: `commande introuvable : ${name} (essayez « help »)`, tone: "error" });
    }
  };

  return (
    <div
      className={`flex ${compact ? "h-40" : "h-56"} shrink-0 flex-col border-t border-border bg-editor`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex h-8 shrink-0 items-center gap-4 border-b border-border bg-chrome px-3 text-[11px] tracking-[0.15em] text-muted-foreground">
        <span className="flex items-center gap-2 border-b-2 border-pink pb-1 pt-1 text-foreground">
          <TerminalSquare className="size-3.5" /> TERMINAL
        </span>
        <span className="hidden sm:inline">PROBLÈMES</span>
        <span className="hidden sm:inline">SORTIE</span>
        <button onClick={onClose} aria-label="Fermer le terminal" className="ml-auto hover:text-foreground">
          <X className="size-3.5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-6">
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
              className={
                l.tone === "error"
                  ? "text-destructive"
                  : l.tone === "ok"
                    ? "text-code-comment"
                    : l.tone === "muted"
                      ? "text-muted-foreground"
                      : "text-foreground/85"
              }
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
