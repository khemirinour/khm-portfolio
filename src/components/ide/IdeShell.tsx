import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Blocks,
  Bug,
  Check,
  ChevronDown,
  CircleUserRound,
  CircleX,
  Clock3,
  Code2,
  Download,
  Files,
  GitBranch,
  HelpCircle,
  Mail,
  PanelBottom,
  PanelLeft,
  Play,
  Search as SearchIcon,
  Settings,
  Sparkles,
  TerminalSquare,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  AboutPane,
  ContactPane,
  ExperiencePane,
  HomePane,
  ProjectsPane,
  ReadmePane,
  SkillsPane,
} from "./panes";
import { FileIcon } from "./FileIcon";
import { Terminal } from "./Terminal";
import { Crosshair } from "./Crosshair";
import { profile, skills } from "./data";
import { NightSky } from "./NightSky";
import { Tutorial, shouldShowTutorial } from "./Tutorial";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChatPanel,
  ExtensionsPanel,
  RunPanel,
  SearchPanel,
  SourceControlPanel,
} from "./SidePanels";
import { CommandPalette, type PaletteCommand } from "./CommandPalette";

type FileName =
  | "home.tsx"
  | "about.html"
  | "projects.js"
  | "skills.json"
  | "experience.ts"
  | "contact.css"
  | "README.md";

const files: FileName[] = [
  "home.tsx",
  "about.html",
  "projects.js",
  "skills.json",
  "experience.ts",
  "contact.css",
  "README.md",
];

type View = "explorer" | "search" | "scm" | "run" | "extensions" | "chat";

type MenuName = "File" | "Edit" | "Selection" | "View" | "Go" | "Run" | "Terminal" | "Help";

type MenuItem = {
  label: string;
  shortcut?: string;
  checked?: boolean;
  divider?: boolean;
  action: () => void;
};

const menus: MenuName[] = ["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Help"];

const CV_URL = "/khemiri_nour_elwoujoud.pdf";

const LANG: Record<string, string> = {
  tsx: "TypeScript JSX",
  ts: "TypeScript",
  js: "JavaScript",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  md: "Markdown",
};

/* ------------------------------------------------------------------ */
/* Bouton de l'activity bar (style VS Code : barre active à gauche)    */
/* ------------------------------------------------------------------ */
function ActivityButton({
  label,
  shortcut,
  active,
  onClick,
  badge,
  tour,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
  tour?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      data-tour={tour}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`group relative flex h-12 w-12 shrink-0 items-center justify-center transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-0.5 bg-pink transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
      />
      {children}
    </button>
  );
}

/** Icône « Contrôle de code source » de VS Code : 3 cercles reliés. */
function SourceControlIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="6" cy="5" r="2.25" />
      <circle cx="6" cy="19" r="2.25" />
      <circle cx="18" cy="7" r="2.25" />
      <path d="M6 7.25v9.5" />
      <path d="M18 9.25c0 4.5-4 4.75-8 5.5-2 .4-3.4 1-4 1.9" />
    </svg>
  );
}

/** Icône « Exécuter et déboguer » : triangle + petit insecte, comme dans VS Code. */
function RunDebugIcon() {
  return (
    <span className="relative inline-flex">
      <Play className="size-6" strokeWidth={1.5} />
      <Bug
        className="absolute -bottom-1 -right-1.5 size-3.5 rounded-full bg-activitybar"
        strokeWidth={2}
      />
    </span>
  );
}

function PopupItem({
  icon,
  label,
  hint,
  onClick,
  href,
}: {
  icon?: ReactNode;
  label: string;
  hint?: string;
  onClick?: () => void;
  href?: string;
}) {
  const cls =
    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-popover-foreground hover:bg-primary hover:text-primary-foreground";
  const inner = (
    <>
      <span className="w-4 text-muted-foreground">{icon}</span>
      <span className="flex-1 whitespace-nowrap">{label}</span>
      {hint && <span className="text-[10px] opacity-70">{hint}</span>}
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls} onClick={onClick}>
      {inner}
    </a>
  ) : (
    <button type="button" className={cls} onClick={onClick}>
      {inner}
    </button>
  );
}

export function IdeShell() {
  const isMobile = useIsMobile();
  const [active, setActive] = useState<FileName>("home.tsx");
  const [open, setOpen] = useState<FileName[]>(["home.tsx"]);
  const [view, setView] = useState<View | null>("explorer");
  const [terminal, setTerminal] = useState(true);
  const [queued, setQueued] = useState<{ id: number; cmd: string } | undefined>();
  const [activeMenu, setActiveMenu] = useState<MenuName | null>(null);
  const [popup, setPopup] = useState<"account" | "manage" | "notifications" | null>(null);
  const [palette, setPalette] = useState<{ open: boolean; mode: "files" | "commands" }>({
    open: false,
    mode: "files",
  });
  const [maximized, setMaximized] = useState(false);
  const [windowState, setWindowState] = useState<"open" | "minimized" | "closed">("open");
  const [nav, setNav] = useState<{ stack: FileName[]; i: number }>({ stack: ["home.tsx"], i: 0 });
  const [time, setTime] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const sidebar = view !== null;

  useEffect(() => {
    const updateTime = () =>
      setTime(
        new Intl.DateTimeFormat("fr-TN", {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).format(new Date()),
      );
    updateTime();

    // Perf mobile : on coupe l'intervalle quand l'onglet n'est pas visible.
    let timer: number | undefined;
    const start = () => {
      if (timer) return;
      timer = window.setInterval(updateTime, 15_000);
    };
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        updateTime();
        start();
      }
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Petit tutoriel affiché automatiquement lors de la première visite.
  useEffect(() => {
    if (!shouldShowTutorial()) return;
    const id = window.setTimeout(() => {
      setView("explorer");
      setTerminal(true);
      setTutorialOpen(true);
    }, 900);
    return () => window.clearTimeout(id);
  }, []);

  // Ferme menus / popups au clic extérieur
  useEffect(() => {
    const close = (event: MouseEvent) => {
      const t = event.target as Node;
      if (!headerRef.current?.contains(t)) setActiveMenu(null);
      if (!activityRef.current?.contains(t) && !statusRef.current?.contains(t)) setPopup(null);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);

  /* ---------------- Actions ---------------- */

  const openFile = useCallback((name: string, fromNav = false) => {
    const f = name as FileName;
    if (!files.includes(f)) return;
    setActive(f);
    setOpen((prev) => (prev.includes(f) ? prev : [...prev, f]));
    setWindowState("open");
    if (!fromNav)
      setNav((h) =>
        h.stack[h.i] === f ? h : { stack: [...h.stack.slice(0, h.i + 1), f], i: h.i + 1 },
      );
  }, []);

  const openFromPanel = (f: string) => {
    openFile(f);
    if (isMobile) setView(null);
  };

  const goBack = () => {
    if (nav.i <= 0) return;
    const f = nav.stack[nav.i - 1];
    if (!f) return;
    setNav((h) => ({ ...h, i: h.i - 1 }));
    openFile(f, true);
  };
  const goForward = () => {
    if (nav.i >= nav.stack.length - 1) return;
    const f = nav.stack[nav.i + 1];
    if (!f) return;
    setNav((h) => ({ ...h, i: h.i + 1 }));
    openFile(f, true);
  };

  const closeTab = (f: FileName) => {
    const next = open.filter((p) => p !== f);
    if (!next.length) {
      setOpen(["home.tsx"]);
      setActive("home.tsx");
      return;
    }
    setOpen(next);
    const last = next[next.length - 1];
    if (f === active && last) setActive(last);
  };

  /** Clic sur une icône : ouvre la vue, ou la referme si elle est déjà active (comportement VS Code). */
  const toggleView = (v: View) => setView((cur) => (cur === v ? null : v));
  const showView = (v: View) => setView(v);
  const toggleSidebar = () => setView((cur) => (cur ? null : "explorer"));

  const runInTerminal = (cmd: string) => {
    setTerminal(true);
    setQueued({ id: Date.now(), cmd });
  };

  const replayTutorial = () => {
    setView("explorer");
    setTerminal(true);
    openFile("home.tsx");
    window.setTimeout(() => setTutorialOpen(true), 250);
  };

  const copyEmail = () => {
    void navigator.clipboard?.writeText(profile.email);
  };

  const openPalette = (mode: "files" | "commands") => setPalette({ open: true, mode });

  /* ---------------- Raccourcis clavier ---------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      let handled = true;
      if (e.key === "F1" || (mod && e.shiftKey && k === "p")) openPalette("commands");
      else if (mod && !e.shiftKey && k === "p") openPalette("files");
      else if (mod && !e.shiftKey && k === "b") toggleSidebar();
      else if (e.ctrlKey && (e.key === "`" || e.code === "Backquote")) setTerminal((t) => !t);
      else if (mod && e.shiftKey && k === "e") showView("explorer");
      else if (mod && e.shiftKey && k === "f") showView("search");
      else if (e.ctrlKey && e.shiftKey && k === "g") showView("scm");
      else if (mod && e.shiftKey && k === "d") showView("run");
      else if (mod && e.shiftKey && k === "x") showView("extensions");
      else if (e.key === "Escape") {
        setActiveMenu(null);
        setPopup(null);
        handled = false;
      } else handled = false;
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runMenuAction = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  const menuItems = (menu: MenuName): MenuItem[] => {
    const items: Record<MenuName, MenuItem[]> = {
      File: [
        { label: "Ouvrir un fichier…", shortcut: "⌘P", action: () => openPalette("files") },
        { label: "Ouvrir home.tsx", action: () => openFile("home.tsx") },
        { label: "Ouvrir README.md", action: () => openFile("README.md") },
        {
          label: "Télécharger le CV",
          divider: true,
          action: () => window.open(CV_URL, "_blank", "noopener"),
        },
        {
          label: "Fermer l'éditeur",
          shortcut: "⌘W",
          divider: true,
          action: () => closeTab(active),
        },
        {
          label: "Fermer tous les éditeurs",
          action: () => {
            setOpen(["home.tsx"]);
            setActive("home.tsx");
          },
        },
      ],
      Edit: [
        { label: "Rechercher", shortcut: "⇧⌘F", action: () => showView("search") },
        { label: "Copier l'e-mail de Nour", divider: true, action: copyEmail },
      ],
      Selection: [
        { label: "Compétences", action: () => openFile("skills.json") },
        { label: "Expériences", action: () => openFile("experience.ts") },
        { label: "Projets", action: () => openFile("projects.js") },
      ],
      View: [
        { label: "Palette de commandes…", shortcut: "⇧⌘P", action: () => openPalette("commands") },
        {
          label: "Explorateur",
          shortcut: "⇧⌘E",
          checked: view === "explorer",
          divider: true,
          action: () => toggleView("explorer"),
        },
        {
          label: "Rechercher",
          shortcut: "⇧⌘F",
          checked: view === "search",
          action: () => toggleView("search"),
        },
        {
          label: "Contrôle de code source",
          shortcut: "⌃⇧G",
          checked: view === "scm",
          action: () => toggleView("scm"),
        },
        {
          label: "Exécuter et déboguer",
          shortcut: "⇧⌘D",
          checked: view === "run",
          action: () => toggleView("run"),
        },
        {
          label: "Extensions",
          shortcut: "⇧⌘X",
          checked: view === "extensions",
          action: () => toggleView("extensions"),
        },
        { label: "Assistant", checked: view === "chat", action: () => toggleView("chat") },
        {
          label: "Barre latérale",
          shortcut: "⌘B",
          checked: sidebar,
          divider: true,
          action: toggleSidebar,
        },
        {
          label: "Terminal",
          shortcut: "⌃`",
          checked: terminal,
          action: () => setTerminal((v) => !v),
        },
        {
          label: "Plein écran",
          shortcut: "⌃⌘F",
          checked: maximized,
          divider: true,
          action: () => setMaximized((v) => !v),
        },
      ],
      Go: [
        { label: "Précédent", shortcut: "⌃-", action: goBack },
        { label: "Suivant", shortcut: "⌃⇧-", action: goForward },
        {
          label: "Aller au fichier…",
          shortcut: "⌘P",
          divider: true,
          action: () => openPalette("files"),
        },
        ...files.map((file, i) => ({
          label: file,
          divider: i === 0,
          action: () => openFile(file),
        })),
      ],
      Run: [
        { label: "Démarrer le portfolio", action: () => runInTerminal("npm run dev") },
        { label: "Afficher l'historique (git log)", action: () => runInTerminal("git log") },
        {
          label: "Ouvrir la vue Exécuter",
          shortcut: "⇧⌘D",
          divider: true,
          action: () => showView("run"),
        },
      ],
      Terminal: [
        { label: "Nouveau terminal", shortcut: "⌃⇧`", action: () => runInTerminal("help") },
        { label: "Exécuter « whoami »", action: () => runInTerminal("whoami") },
        { label: "Effacer le terminal", action: () => runInTerminal("clear") },
        {
          label: "Fermer le terminal",
          shortcut: "⌃`",
          divider: true,
          action: () => setTerminal(false),
        },
      ],
      Help: [
        { label: "Bienvenue", action: () => openFile("README.md") },
        { label: "Visite guidée", action: replayTutorial },
        {
          label: "Afficher toutes les commandes",
          shortcut: "⇧⌘P",
          action: () => openPalette("commands"),
        },
        { label: "À propos", divider: true, action: () => openFile("about.html") },
        { label: "Contact", action: () => openFile("contact.css") },
      ],
    };
    return items[menu];
  };

  const commands: PaletteCommand[] = [
    {
      id: "explorer",
      label: "Afficher : Explorateur",
      shortcut: "⇧⌘E",
      run: () => showView("explorer"),
    },
    {
      id: "search",
      label: "Afficher : Rechercher",
      shortcut: "⇧⌘F",
      run: () => showView("search"),
    },
    {
      id: "scm",
      label: "Afficher : Contrôle de code source",
      shortcut: "⌃⇧G",
      run: () => showView("scm"),
    },
    {
      id: "run",
      label: "Afficher : Exécuter et déboguer",
      shortcut: "⇧⌘D",
      run: () => showView("run"),
    },
    {
      id: "ext",
      label: "Afficher : Extensions (compétences)",
      shortcut: "⇧⌘X",
      run: () => showView("extensions"),
    },
    { id: "chat", label: "Afficher : Assistant", run: () => showView("chat") },
    { id: "sidebar", label: "Basculer la barre latérale", shortcut: "⌘B", run: toggleSidebar },
    { id: "term", label: "Terminal : basculer", shortcut: "⌃`", run: () => setTerminal((t) => !t) },
    { id: "dev", label: "Terminal : npm run dev", run: () => runInTerminal("npm run dev") },
    { id: "full", label: "Basculer le plein écran", run: () => setMaximized((m) => !m) },
    { id: "cv", label: "Télécharger le CV", run: () => window.open(CV_URL, "_blank", "noopener") },
    {
      id: "gh",
      label: "Ouvrir GitHub",
      run: () => window.open(profile.github, "_blank", "noopener"),
    },
    {
      id: "li",
      label: "Ouvrir LinkedIn",
      run: () => window.open(profile.linkedin, "_blank", "noopener"),
    },
    { id: "mail", label: "Copier l'e-mail", run: copyEmail },
    { id: "tour", label: "Aide : visite guidée", run: replayTutorial },
  ];

  /* ---------------- Contenu de la barre latérale ---------------- */
  const closeOnMobile = isMobile ? () => setView(null) : undefined;

  const explorer = (
    <>
      <div className="flex h-9 shrink-0 items-center justify-between px-4 text-[11px] tracking-[0.12em] text-muted-foreground">
        EXPLORATEUR
        {isMobile && (
          <button
            type="button"
            onClick={() => setView(null)}
            aria-label="Fermer l'explorateur"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 px-3 text-[11px] font-bold tracking-[0.08em] text-foreground/80">
        <ChevronDown className="size-3.5" />
        PORTFOLIO
      </div>

      <nav data-tour="sidebar-files" className="flex-1 overflow-y-auto pb-4 pt-1">
        {files.map((f) => (
          <button
            key={f}
            type="button"
            title={`Ouvrir ${f}`}
            onClick={() => openFromPanel(f)}
            className={`flex w-full items-center gap-2 py-1.5 pl-6 pr-4 text-left text-[13px] transition-colors ${
              active === f
                ? "border-l-2 border-pink bg-sidebar-active text-foreground"
                : "border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-active hover:text-foreground"
            }`}
          >
            <FileIcon name={f} className="size-3.5 shrink-0" />
            {f}
          </button>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
        <span className="text-code-kw">✦</span> {profile.location}
      </div>
    </>
  );

  const panelContent: Record<View, ReactNode> = {
    explorer,
    search: <SearchPanel onOpen={openFromPanel} onClose={closeOnMobile} />,
    scm: <SourceControlPanel onOpen={openFromPanel} onClose={closeOnMobile} />,
    run: (
      <RunPanel
        onOpen={openFromPanel}
        onClose={closeOnMobile}
        onRun={(cmd) => {
          runInTerminal(cmd);
          if (isMobile) setView(null);
        }}
      />
    ),
    extensions: <ExtensionsPanel onOpen={openFromPanel} onClose={closeOnMobile} />,
    chat: <ChatPanel onOpen={openFromPanel} onClose={closeOnMobile} />,
  };

  const iconBtn =
    "flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-sidebar-active hover:text-foreground";

  const hidden = windowState !== "open";

  return (
    <div
      className={`relative min-h-screen min-h-[100dvh] overflow-hidden ${
        maximized ? "p-0" : "p-0 md:p-8 lg:p-12"
      }`}
    >
      {/* Lien d'évitement clavier : invisible sauf au focus (Tab) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-xs focus:text-primary-foreground"
      >
        Aller au contenu principal
      </a>

      {/* Background extérieur : ciel étoilé */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <NightSky />
      </div>

      <Crosshair />

      <Tutorial open={tutorialOpen} onOpenChange={setTutorialOpen} />

      <CommandPalette
        open={palette.open}
        initialMode={palette.mode}
        files={files}
        commands={commands}
        onOpenFile={(f) => openFile(f)}
        onClose={() => setPalette((p) => ({ ...p, open: false }))}
      />

      {/* Dock macOS : visible quand la fenêtre est réduite ou fermée */}
      <div
        className={`fixed inset-x-0 bottom-4 z-[120] flex flex-col items-center gap-2 transition-all duration-500 ${
          hidden ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"
        }`}
      >
        <p className="rounded-md bg-black/40 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
          {windowState === "closed" ? "Fenêtre fermée" : "Fenêtre réduite"} — cliquez sur l'icône
          pour rouvrir
        </p>
        <div className="flex items-end gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 pb-1.5 pt-2 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              if (windowState === "closed") {
                setOpen(["home.tsx"]);
                setActive("home.tsx");
              }
              setWindowState("open");
            }}
            title="Portfolio — Nour"
            aria-label="Rouvrir la fenêtre du portfolio"
            className="flex flex-col items-center gap-1 transition-transform hover:-translate-y-1.5"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-pink text-primary-foreground shadow-lg">
              <Code2 className="size-6" />
            </span>
            <span className="size-1 rounded-full bg-white/80" />
          </button>
        </div>
      </div>

      {/* Fenêtre VS Code */}
      <div
        aria-hidden={hidden}
        className={`relative z-10 mx-auto flex origin-bottom flex-col overflow-hidden border border-border bg-editor transition-[transform,opacity] duration-500 ease-in-out ${
          isMobile ? "shadow-lg" : "shadow-2xl"
        } ${
          maximized
            ? "h-screen h-[100dvh] max-w-none rounded-none"
            : "h-screen h-[100dvh] max-w-[1400px] md:h-[calc(100vh-4rem)] md:rounded-xl lg:h-[calc(100vh-6rem)]"
        } ${hidden ? "pointer-events-none translate-y-[45vh] scale-[0.15] opacity-0" : ""}`}
      >
        {/* Barre de titre macOS / VS Code */}
        <div
          ref={headerRef}
          onDoubleClick={(e) => {
            if (e.target === e.currentTarget) setMaximized((v) => !v);
          }}
          className="relative z-30 flex h-10 shrink-0 items-center gap-2 border-b border-border bg-chrome px-3"
        >
          {/* Feux tricolores macOS */}
          <div className="group/mac flex shrink-0 items-center gap-2 pl-1 pr-1">
            <button
              type="button"
              title="Fermer"
              aria-label="Fermer la fenêtre"
              onClick={() => setWindowState("closed")}
              className="flex size-3 items-center justify-center rounded-full bg-mac-close text-mac-symbol ring-1 ring-mac-ring active:bg-mac-close-active"
            >
              <svg
                className="size-2 opacity-0 group-hover/mac:opacity-80"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" />
              </svg>
            </button>
            <button
              type="button"
              title="Réduire"
              aria-label="Réduire la fenêtre"
              onClick={() => setWindowState("minimized")}
              className="flex size-3 items-center justify-center rounded-full bg-mac-minimize text-mac-symbol ring-1 ring-mac-ring active:bg-mac-minimize-active"
            >
              <svg
                className="size-2 opacity-0 group-hover/mac:opacity-80"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M2.5 6h7" />
              </svg>
            </button>
            <button
              type="button"
              title={maximized ? "Quitter le plein écran" : "Plein écran"}
              aria-label={maximized ? "Quitter le plein écran" : "Plein écran"}
              onClick={() => setMaximized((v) => !v)}
              className="flex size-3 items-center justify-center rounded-full bg-mac-maximize text-mac-symbol ring-1 ring-mac-ring active:bg-mac-maximize-active"
            >
              <svg
                className="size-2 opacity-0 group-hover/mac:opacity-80"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                {maximized ? (
                  <path d="M6.5 1.5v4h4zM5.5 10.5v-4h-4z" />
                ) : (
                  <path d="M3 9V4.2L7.8 9zM9 3v4.8L4.2 3z" />
                )}
              </svg>
            </button>
          </div>

          {/* Menus — masqués sur mobile pour éviter le débordement horizontal */}
          <nav
            aria-label="Menu principal"
            className="hidden h-full items-center text-xs text-muted-foreground lg:flex"
          >
            {menus.map((m) => (
              <div key={m} className="relative flex h-full items-center">
                <button
                  type="button"
                  aria-expanded={activeMenu === m}
                  aria-haspopup="menu"
                  onClick={() => setActiveMenu((current) => (current === m ? null : m))}
                  onMouseEnter={() => {
                    if (activeMenu) setActiveMenu(m);
                  }}
                  className={`flex h-7 items-center rounded px-2 transition-colors ${
                    activeMenu === m
                      ? "bg-sidebar-active text-foreground"
                      : "hover:bg-sidebar-active hover:text-foreground"
                  }`}
                >
                  {m}
                </button>

                {activeMenu === m && (
                  <div
                    className="absolute left-0 top-full z-50 min-w-60 rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-xl"
                    role="menu"
                  >
                    {menuItems(m).map((item) => (
                      <div key={item.label}>
                        {item.divider && <div className="my-1 h-px bg-border" />}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => runMenuAction(item.action)}
                          className="mx-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-sm px-2 py-1 text-left text-xs hover:bg-primary hover:text-primary-foreground"
                        >
                          <span className="w-3">
                            {item.checked && <Check className="size-3" />}
                          </span>
                          <span className="flex-1 whitespace-nowrap">{item.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Centre : navigation + Command Center */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
            <button
              type="button"
              onClick={goBack}
              disabled={nav.i <= 0}
              title="Précédent"
              aria-label="Fichier précédent"
              className={`${iconBtn} hidden disabled:opacity-30 disabled:hover:bg-transparent md:flex`}
            >
              <ArrowLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={goForward}
              disabled={nav.i >= nav.stack.length - 1}
              title="Suivant"
              aria-label="Fichier suivant"
              className={`${iconBtn} hidden disabled:opacity-30 disabled:hover:bg-transparent md:flex`}
            >
              <ArrowRight className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => openPalette("files")}
              title="Rechercher un fichier"
              className="flex h-6 w-full min-w-0 max-w-[26rem] items-center justify-center gap-2 rounded-md border border-border bg-editor/70 px-3 text-xs text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-editor hover:text-foreground"
            >
              <SearchIcon className="size-3 shrink-0" />
              <span className="truncate">khemiri-nour</span>
            </button>
          </div>

          {/* Droite : dispositions + aide */}
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={toggleSidebar}
              title="Basculer la barre latérale"
              aria-label="Basculer la barre latérale"
              aria-pressed={sidebar}
              className={`${iconBtn} hidden md:flex ${sidebar ? "text-foreground" : ""}`}
            >
              <PanelLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setTerminal((t) => !t)}
              title="Basculer le panneau"
              aria-label="Basculer le terminal"
              aria-pressed={terminal}
              className={`${iconBtn} hidden md:flex ${terminal ? "text-foreground" : ""}`}
            >
              <PanelBottom className="size-4" />
            </button>
            <button
              type="button"
              onClick={replayTutorial}
              title="Revoir le tutoriel"
              aria-label="Revoir le tutoriel de visite du portfolio"
              className={`${iconBtn} hover:text-pink`}
            >
              <HelpCircle className="size-4" />
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex min-h-0 flex-1">
          {/* Activity bar */}
          <div
            ref={activityRef}
            className="relative z-40 flex w-12 shrink-0 flex-col items-center justify-between border-r border-border bg-activitybar"
          >
            <div className="flex flex-col items-center">
              <ActivityButton
                label="Explorateur"
                shortcut="⇧⌘E"
                tour="activity-explorer"
                active={view === "explorer"}
                onClick={() => toggleView("explorer")}
              >
                <Files className="size-6" strokeWidth={1.5} />
              </ActivityButton>
              <ActivityButton
                label="Rechercher"
                shortcut="⇧⌘F"
                active={view === "search"}
                onClick={() => toggleView("search")}
              >
                <SearchIcon className="size-6" strokeWidth={1.5} />
              </ActivityButton>
              <ActivityButton
                label="Contrôle de code source"
                shortcut="⌃⇧G"
                active={view === "scm"}
                onClick={() => toggleView("scm")}
              >
                <SourceControlIcon />
              </ActivityButton>
              <ActivityButton
                label="Exécuter et déboguer"
                shortcut="⇧⌘D"
                active={view === "run"}
                onClick={() => toggleView("run")}
              >
                <RunDebugIcon />
              </ActivityButton>
              <ActivityButton
                label="Extensions"
                shortcut="⇧⌘X"
                active={view === "extensions"}
                onClick={() => toggleView("extensions")}
              >
                <Blocks className="size-6" strokeWidth={1.5} />
              </ActivityButton>
              <ActivityButton
                label="Assistant"
                active={view === "chat"}
                onClick={() => toggleView("chat")}
              >
                <Sparkles className="size-6" strokeWidth={1.5} />
              </ActivityButton>
              <ActivityButton
                label="Terminal"
                shortcut="⌃`"
                tour="activity-terminal"
                active={terminal}
                onClick={() => setTerminal((t) => !t)}
              >
                <TerminalSquare className="size-6" strokeWidth={1.5} />
              </ActivityButton>
            </div>

            <div className="flex flex-col items-center">
              <ActivityButton
                label="Comptes"
                active={popup === "account"}
                onClick={() => setPopup((p) => (p === "account" ? null : "account"))}
              >
                <CircleUserRound className="size-6" strokeWidth={1.5} />
              </ActivityButton>
              <ActivityButton
                label="Gérer"
                active={popup === "manage"}
                onClick={() => setPopup((p) => (p === "manage" ? null : "manage"))}
              >
                <Settings className="size-6" strokeWidth={1.5} />
              </ActivityButton>

              {popup === "account" && (
                <div
                  role="menu"
                  className="absolute bottom-12 left-full ml-1 w-64 rounded-md border border-border bg-popover py-1 shadow-xl"
                >
                  <div className="border-b border-border px-3 pb-2 pt-1">
                    <p className="text-xs font-bold text-foreground">
                      {profile.first} {profile.last}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{profile.tags[0]}</p>
                  </div>
                  <div className="py-1">
                    <PopupItem
                      icon={<GitBranch className="size-3.5" />}
                      label="GitHub"
                      href={profile.github}
                      onClick={() => setPopup(null)}
                    />
                    <PopupItem
                      icon={<CircleUserRound className="size-3.5" />}
                      label="LinkedIn"
                      href={profile.linkedin}
                      onClick={() => setPopup(null)}
                    />
                    <PopupItem
                      icon={<Blocks className="size-3.5" />}
                      label="Kaggle"
                      href={profile.kaggle}
                      onClick={() => setPopup(null)}
                    />
                    <PopupItem
                      icon={<Download className="size-3.5" />}
                      label="Télécharger le CV"
                      href={CV_URL}
                      onClick={() => setPopup(null)}
                    />
                    <PopupItem
                      icon={<Mail className="size-3.5" />}
                      label="Copier l'e-mail"
                      hint={profile.email}
                      onClick={() => {
                        copyEmail();
                        setPopup(null);
                      }}
                    />
                  </div>
                </div>
              )}

              {popup === "manage" && (
                <div
                  role="menu"
                  className="absolute bottom-0 left-full ml-1 w-60 rounded-md border border-border bg-popover py-1 shadow-xl"
                >
                  <PopupItem
                    label="Palette de commandes…"
                    onClick={() => {
                      setPopup(null);
                      openPalette("commands");
                    }}
                  />
                  <PopupItem
                    label="Ouvrir un fichier…"
                    onClick={() => {
                      setPopup(null);
                      openPalette("files");
                    }}
                  />
                  <div className="my-1 h-px bg-border" />
                  <PopupItem
                    label={maximized ? "Quitter le plein écran" : "Plein écran"}
                    onClick={() => {
                      setPopup(null);
                      setMaximized((m) => !m);
                    }}
                  />
                  <PopupItem
                    label="Basculer la barre latérale"
                    onClick={() => {
                      setPopup(null);
                      toggleSidebar();
                    }}
                  />
                  <div className="my-1 h-px bg-border" />
                  <PopupItem
                    label="Visite guidée"
                    onClick={() => {
                      setPopup(null);
                      replayTutorial();
                    }}
                  />
                  <PopupItem
                    label="Thème : Nour Dark"
                    icon={<Check className="size-3.5" />}
                    onClick={() => setPopup(null)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Barre latérale (vue active) */}
          {view && (
            <>
              {/* Sur mobile : tiroir + fond assombri cliquable pour fermer */}
              {isMobile && (
                <button
                  type="button"
                  aria-label="Fermer la barre latérale"
                  onClick={() => setView(null)}
                  className="fixed inset-0 z-40 bg-background/60 md:hidden"
                />
              )}
              <aside
                className={
                  isMobile
                    ? "fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col border-r border-border bg-sidebar shadow-2xl md:hidden"
                    : "hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex"
                }
              >
                {panelContent[view]}
              </aside>
            </>
          )}

          {/* Éditeur */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex min-w-0 flex-1 flex-col bg-editor outline-none"
          >
            {/* Onglets */}
            <div
              data-tour="tabs"
              className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border bg-chrome"
            >
              {open.map((f) => (
                <div
                  key={f}
                  onMouseDown={(e) => {
                    // clic molette = fermer l'onglet, comme dans VS Code
                    if (e.button === 1) {
                      e.preventDefault();
                      closeTab(f);
                    }
                  }}
                  className={`group/tab flex shrink-0 items-center gap-2 border-r border-border px-3 text-xs ${
                    active === f
                      ? "border-t-2 border-t-pink bg-tab-active text-foreground"
                      : "border-t-2 border-t-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openFile(f)}
                    className="flex items-center gap-2"
                  >
                    <FileIcon name={f} className="size-3.5" />
                    {f}
                  </button>

                  <button
                    type="button"
                    onClick={() => closeTab(f)}
                    aria-label={`Fermer ${f}`}
                    className={`rounded p-0.5 hover:bg-sidebar-active ${active === f ? "opacity-70" : "opacity-0 group-hover/tab:opacity-70"} hover:!opacity-100`}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Fil d'Ariane */}
            <div className="flex h-6 shrink-0 items-center gap-2 border-b border-border px-4 text-[11px] text-muted-foreground">
              <button
                type="button"
                onClick={() => showView("explorer")}
                className="hover:text-foreground"
              >
                khemiri-nour
              </button>
              <span>›</span>
              <button
                type="button"
                onClick={() => showView("explorer")}
                className="hover:text-foreground"
              >
                src
              </button>
              <span>›</span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <FileIcon name={active} className="size-3" />
                {active}
              </span>
            </div>

            {/* Contenu du fichier */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {active === "home.tsx" && <HomePane onOpen={(f) => openFile(f)} />}
              {active === "about.html" && <AboutPane />}
              {active === "projects.js" && <ProjectsPane />}
              {active === "skills.json" && <SkillsPane />}
              {active === "experience.ts" && <ExperiencePane />}
              {active === "contact.css" && <ContactPane />}
              {active === "README.md" && <ReadmePane />}
            </div>

            {/* Terminal */}
            {terminal && (
              <Terminal
                files={files}
                onOpen={(f) => openFile(f)}
                onClose={() => setTerminal(false)}
                compact={isMobile}
                queued={queued}
              />
            )}
          </main>
        </div>

        {/* Barre d'état */}
        <div
          ref={statusRef}
          className="relative flex h-6 shrink-0 items-stretch justify-between bg-status text-[11px] text-status-foreground"
        >
          <div className="flex items-stretch">
            <button
              type="button"
              onClick={() => openPalette("commands")}
              title="Palette de commandes"
              className="flex items-center bg-pink/90 px-2.5 hover:bg-pink"
            >
              <Code2 aria-hidden className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => showView("scm")}
              title="Contrôle de code source"
              className="flex items-center gap-1 px-2 hover:bg-white/15"
            >
              <SourceControlIcon className="size-3" />
              main*
            </button>
            <button
              type="button"
              onClick={() => setTerminal(true)}
              title="Aucun problème"
              className="flex items-center gap-1 px-2 hover:bg-white/15"
            >
              <CircleX aria-hidden className="size-3" /> 0
              <TriangleAlert aria-hidden className="ml-1 size-3" /> 0
            </button>
          </div>

          <div className="flex items-stretch">
            <span className="hidden items-center px-2 md:flex">UTF-8</span>
            <button
              type="button"
              onClick={() => openFile(active)}
              className="hidden items-center px-2 hover:bg-white/15 md:flex"
            >
              {LANG[active.split(".").pop() ?? ""] ?? "Texte"}
            </button>
            <span className="hidden items-center gap-1 px-2 md:flex">
              <Check aria-hidden className="size-3" /> Prettier
            </span>
            <span
              className="flex items-center gap-1 px-2 tabular-nums"
              aria-label={`Heure locale ${time}`}
            >
              <Clock3 aria-hidden className="size-3" />
              {time}
            </span>
            <button
              type="button"
              onClick={() => setPopup((p) => (p === "notifications" ? null : "notifications"))}
              title="Notifications"
              aria-label="Notifications"
              className="flex items-center px-2 hover:bg-white/15"
            >
              <Bell aria-hidden className="size-3" />
            </button>
          </div>

          {popup === "notifications" && (
            <div className="absolute bottom-full right-2 mb-2 w-72 rounded-md border border-border bg-popover p-3 text-xs text-popover-foreground shadow-xl">
              <div className="mb-2 flex items-center justify-between text-[10px] tracking-[0.12em] text-muted-foreground">
                NOTIFICATIONS
                <button
                  type="button"
                  onClick={() => setPopup(null)}
                  aria-label="Fermer"
                  className="hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <p>
                👋 Bienvenue ! Nour est ouverte aux opportunités en IA, Full Stack et DevSecOps.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPopup(null);
                  openFile("contact.css");
                }}
                className="mt-2 rounded-sm bg-primary px-2 py-1 text-[11px] text-primary-foreground hover:opacity-90"
              >
                La contacter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
