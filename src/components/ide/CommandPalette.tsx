import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { FileIcon } from "./FileIcon";

export type PaletteCommand = { id: string; label: string; shortcut?: string; run: () => void };

/**
 * Palette façon VS Code :
 *  - mode fichiers (⌘P) : tape un nom de fichier
 *  - mode commandes (⇧⌘P ou préfixe « > »)
 */
export function CommandPalette({
  open,
  initialMode,
  files,
  commands,
  onOpenFile,
  onClose,
}: {
  open: boolean;
  initialMode: "files" | "commands";
  files: string[];
  commands: PaletteCommand[];
  onOpenFile: (f: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(initialMode === "commands" ? "> " : "");
      setIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, initialMode]);

  const isCmd = value.startsWith(">");
  const query = (isCmd ? value.slice(1) : value).trim().toLowerCase();

  const items = useMemo(() => {
    if (isCmd)
      return commands
        .filter((c) => c.label.toLowerCase().includes(query))
        .map((c) => ({
          key: c.id,
          label: c.label,
          shortcut: c.shortcut,
          file: undefined as string | undefined,
          run: c.run,
        }));
    return files
      .filter((f) => f.toLowerCase().includes(query))
      .map((f) => ({ key: f, label: f, shortcut: undefined, file: f, run: () => onOpenFile(f) }));
  }, [isCmd, query, commands, files, onOpenFile]);

  if (!open) return null;

  const exec = (i: number) => {
    const item = items[i];
    if (!item) return;
    onClose();
    item.run();
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex justify-center bg-black/20 pt-14"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-label="Palette de commandes"
        onMouseDown={(e) => e.stopPropagation()}
        className="h-fit w-[min(600px,92vw)] overflow-hidden rounded-md border border-border bg-popover shadow-2xl"
      >
        <div className="p-1.5">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, items.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                exec(index);
              }
            }}
            placeholder={
              isCmd
                ? "Tapez une commande"
                : "Rechercher un fichier (tapez « > » pour les commandes)"
            }
            aria-label="Rechercher"
            spellCheck={false}
            className="w-full rounded-sm border border-primary bg-editor px-2 py-1.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul role="listbox" className="max-h-80 overflow-y-auto pb-1.5">
          {items.length === 0 && (
            <li className="px-3 py-2 text-xs text-muted-foreground">Aucun résultat</li>
          )}
          {items.map((it, i) => (
            <li key={it.key} role="option" aria-selected={i === index}>
              <button
                type="button"
                onMouseEnter={() => setIndex(i)}
                onClick={() => exec(i)}
                className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] ${
                  i === index ? "bg-primary/35 text-foreground" : "text-foreground/85"
                }`}
              >
                {it.file ? (
                  <FileIcon name={it.file} className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                )}
                <span className="flex-1 truncate">{it.label}</span>
                {it.file && <span className="text-[11px] text-muted-foreground">src</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
