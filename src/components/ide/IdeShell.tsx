import { useEffect, useRef, useState } from "react";
import {
  Files,
  GitBranch,
  Search as SearchIcon,
  Settings,
  Sparkles,
  X,
  Bell,
  Circle,
  ChevronDown,
  TerminalSquare,
  Clock3,
  Check,
  HelpCircle,
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
import { profile } from "./data";
import { NightSky } from "./NightSky";
import { Tutorial, shouldShowTutorial } from "./Tutorial";


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

type MenuName = "File" | "Edit" | "View" | "Go" | "Run" | "Terminal" | "Help";

type MenuItem = {
  label: string;
  shortcut?: string;
  checked?: boolean;
  divider?: boolean;
  action: () => void;
};

const menus: MenuName[] = ["File", "Edit", "View", "Go", "Run", "Terminal", "Help"];

export function IdeShell() {
  const [active, setActive] = useState<FileName>("home.tsx");
  const [open, setOpen] = useState<FileName[]>(["home.tsx"]);
  const [sidebar, setSidebar] = useState(true);
  const [terminal, setTerminal] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuName | null>(null);
  const [maximized, setMaximized] = useState(false);
  const [time, setTime] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () =>
      setTime(new Intl.DateTimeFormat("fr-TN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date()));
    updateTime();

    // Perf mobile : on coupe l'intervalle quand l'onglet n'est pas visible
    // (économise CPU/batterie au lieu de faire tourner un setInterval en fond en permanence).
    let timer: number | undefined;
    const start = () => {
      if (timer) return;
      timer = window.setInterval(updateTime, 1000);
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

  // Petit tutoriel affiché automatiquement lors de la première visite
  // (mémorisé en localStorage par le composant Tutorial, ne réapparaît pas ensuite).
  useEffect(() => {
    if (!shouldShowTutorial()) return;
    const id = window.setTimeout(() => {
      setSidebar(true);
      setTerminal(true);
      setTutorialOpen(true);
    }, 900);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replayTutorial = () => {
    setSidebar(true);
    setTerminal(true);
    setActive("home.tsx");
    setOpen((prev) => (prev.includes("home.tsx") ? prev : [...prev, "home.tsx"]));
    window.setTimeout(() => setTutorialOpen(true), 250);
  };

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setActiveMenu(null);
    };
    window.addEventListener("mousedown", closeMenu);
    return () => window.removeEventListener("mousedown", closeMenu);
  }, []);

  const openFile = (name: string) => {
    const f = name as FileName;
    if (!files.includes(f)) return;
    setActive(f);
    setOpen((prev) => (prev.includes(f) ? prev : [...prev, f]));
  };

  const closeTab = (f: FileName) => {
    setOpen((prev) => {
      const next = prev.filter((p) => p !== f);
      const last = next[next.length - 1];
      if (f === active && last) setActive(last);

      return next.length ? next : ["home.tsx"];
    });
  };

  const runMenuAction = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  const menuItems = (menu: MenuName): MenuItem[] => {
    const items: Record<MenuName, MenuItem[]> = {
      File: [
        { label: "Open Home", shortcut: "⌘O", action: () => openFile("home.tsx") },
        { label: "Open README", shortcut: "⌘R", action: () => openFile("README.md") },
        { label: "Close Editor", shortcut: "⌘W", divider: true, action: () => closeTab(active) },
      ],
      Edit: [
        { label: "About Nour", action: () => openFile("about.html") },
        { label: "Skills", action: () => openFile("skills.json") },
        { label: "Experience", action: () => openFile("experience.ts") },
      ],
      View: [
        { label: "Explorer", shortcut: "⇧⌘E", checked: sidebar, action: () => setSidebar((value) => !value) },
        { label: "Terminal", shortcut: "⌃`", checked: terminal, action: () => setTerminal((value) => !value) },
        { label: "Maximize Window", shortcut: "⌃⌘F", checked: maximized, divider: true, action: () => setMaximized((value) => !value) },
      ],
      Go: files.map((file) => ({ label: file, action: () => openFile(file) })),
      Run: [
        { label: "Run Portfolio", shortcut: "F5", action: () => openFile("home.tsx") },
        { label: "Run Projects", action: () => openFile("projects.js") },
      ],
      Terminal: [
        { label: "New Terminal", shortcut: "⌃⇧`", action: () => setTerminal(true) },
        { label: "Close Terminal", shortcut: "⌃`", action: () => setTerminal(false) },
      ],
      Help: [
        { label: "Welcome", action: () => openFile("README.md") },
        { label: "About", action: () => openFile("about.html") },
        { label: "Contact", divider: true, action: () => openFile("contact.css") },
      ],
    };
    return items[menu];
  };

 return (
  <div
    className={`relative min-h-screen overflow-hidden ${
      maximized ? "p-0" : "p-0 md:p-8 lg:p-12"
    }`}
  >
    {/* Background extérieur : ciel étoilé */}
    <div className="pointer-events-none fixed inset-0 z-0">
      <NightSky />
    </div>

    <Crosshair />

    <Tutorial open={tutorialOpen} onOpenChange={setTutorialOpen} />

    {/* Fenêtre VS Code */}
    <div
      className={`relative z-10 mx-auto flex flex-col overflow-hidden border border-border bg-editor shadow-2xl ${
        maximized
          ? "h-screen max-w-none rounded-none"
          : "h-screen max-w-[1400px] md:h-[calc(100vh-4rem)] md:rounded-xl lg:h-[calc(100vh-6rem)]"
      }`}
    >
      {/* macOS / VS Code title bar */}
      <div
        ref={headerRef}
        className="relative z-30 flex h-10 shrink-0 items-center border-b border-border bg-chrome px-3"
      >
        {/* Boutons macOS */}
        <div className="group/mac flex shrink-0 items-center gap-2 pl-1">
          {/* Fermer */}
          <button
            type="button"
            title="Fermer"
            aria-label="Fermer"
            onClick={() => {
              setOpen(["home.tsx"]);
              setActive("home.tsx");
            }}
            className="relative flex size-3.5 items-center justify-center rounded-full bg-mac-close text-mac-symbol shadow-sm ring-1 ring-mac-ring transition-colors hover:bg-mac-close-active"
          >
            <svg
              className="size-2 opacity-0 transition-opacity group-hover/mac:opacity-70"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>

          {/* Réduire */}
          <button
            type="button"
            title="Réduire"
            aria-label="Réduire"
            onClick={() => setTerminal(false)}
            className="relative flex size-3.5 items-center justify-center rounded-full bg-mac-minimize text-mac-symbol shadow-sm ring-1 ring-mac-ring transition-colors hover:bg-mac-minimize-active"
          >
            <svg
              className="size-2 opacity-0 transition-opacity group-hover/mac:opacity-70"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2.5 6h7" />
            </svg>
          </button>

          {/* Agrandir */}
          <button
            type="button"
            title="Agrandir"
            aria-label="Agrandir"
            onClick={() => setMaximized((value) => !value)}
            className="relative flex size-3.5 items-center justify-center rounded-full bg-mac-maximize text-mac-symbol shadow-sm ring-1 ring-mac-ring transition-colors hover:bg-mac-maximize-active"
          >
            <svg
              className="size-2.5 opacity-0 transition-opacity group-hover/mac:opacity-70"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 7.5V9.5H4.5M9.5 4.5V2.5H7.5M9.5 2.5L2.5 9.5" />
            </svg>
          </button>
        </div>

        {/* Menu VS Code */}
        <nav
          aria-label="Menu principal"
          className="ml-3 flex h-full items-center text-xs text-muted-foreground"
        >
          {menus.map((m) => (
            <div key={m} className="relative h-full">
              <button
                type="button"
                aria-expanded={activeMenu === m}
                onClick={() =>
                  setActiveMenu((current) => (current === m ? null : m))
                }
                onMouseEnter={() => {
                  if (activeMenu) {
                    setActiveMenu(m);
                  }
                }}
                className={`flex h-full items-center px-2 transition-colors ${
                  activeMenu === m
                    ? "bg-sidebar-active text-foreground"
                    : "hover:bg-sidebar-active hover:text-foreground"
                }`}
              >
                {m}
              </button>

              {activeMenu === m && (
                <div
                  className="absolute left-0 top-full z-50 min-w-56 border border-border bg-popover py-1 text-popover-foreground shadow-xl"
                  role="menu"
                >
                  {menuItems(m).map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      onClick={() => runMenuAction(item.action)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-primary hover:text-primary-foreground ${
                        item.divider
                          ? "mt-1 border-t border-border pt-2"
                          : ""
                      }`}
                    >
                      <span className="w-3">
                        {item.checked && <Check className="size-3" />}
                      </span>

                      <span className="flex-1 whitespace-nowrap">
                        {item.label}
                      </span>

                      {item.shortcut && (
                        <span className="text-muted-foreground">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Recherche / titre */}
        <div className="mx-auto hidden w-80 items-center gap-2 rounded-md border border-border bg-editor px-3 py-1 text-xs text-muted-foreground md:flex">
          <SearchIcon className="size-3" />
          khemiri-nour : portfolio
        </div>

        {/* Bouton d'aide : relance la visite guidée à tout moment */}
        <button
          type="button"
          onClick={replayTutorial}
          title="Revoir le tutoriel"
          aria-label="Revoir le tutoriel de visite du portfolio"
          className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-pink hover:text-pink"
        >
          <HelpCircle className="size-3.5" />
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex min-h-0 flex-1">
        {/* Activity bar */}
        <div className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-border bg-activitybar py-3">
          <div className="flex flex-col items-center gap-5">
            <button
              type="button"
              data-tour="activity-explorer"
              onClick={() => setSidebar((s) => !s)}
              aria-label="Explorateur"
              title="Afficher / masquer l'explorateur de fichiers"
              className={
                sidebar ? "text-pink" : "text-muted-foreground"
              }
            >
              <Files className="size-5" />
            </button>

            <SearchIcon className="size-5 text-muted-foreground" />

            <GitBranch className="size-5 text-muted-foreground" />

            <Sparkles className="size-5 text-muted-foreground" />

            <button
              type="button"
              data-tour="activity-terminal"
              onClick={() => setTerminal((t) => !t)}
              aria-label="Terminal"
              title="Afficher / masquer le terminal"
              className={
                terminal ? "text-pink" : "text-muted-foreground"
              }
            >
              <TerminalSquare className="size-5" />
            </button>
          </div>

          <Settings className="size-5 text-muted-foreground" />
        </div>

        {/* Explorer */}
        {sidebar && (
          <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
            <div className="px-4 py-3 text-[11px] tracking-[0.18em] text-muted-foreground">
              EXPLORATEUR
            </div>

            <div className="flex items-center gap-1 px-3 text-[11px] tracking-[0.12em] text-foreground/80">
              <ChevronDown className="size-3" />
              PORTFOLIO
            </div>

            <nav data-tour="sidebar-files" className="flex-1 overflow-y-auto pb-4 pt-1">
              {files.map((f) => (
                <button
                  key={f}
                  type="button"
                  title={`Ouvrir ${f}`}
                  onClick={() => openFile(f)}
                  className={`flex w-full items-center gap-2 py-1.5 pl-6 pr-4 text-left text-[13px] transition-colors ${
                    active === f
                      ? "border-l-2 border-pink bg-sidebar-active text-foreground"
                      : "border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-active hover:text-foreground"
                  }`}
                >
                  <FileIcon
                    name={f}
                    className="size-3.5 shrink-0"
                  />
                  {f}
                </button>
              ))}
            </nav>

            <div className="border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
              <span className="text-code-kw">✦</span>{" "}
              {profile.location}
            </div>
          </aside>
        )}

        {/* Editor */}
        <main className="flex min-w-0 flex-1 flex-col bg-editor">
          {/* Tabs */}
          <div data-tour="tabs" className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-border bg-chrome">
            {open.map((f) => (
              <div
                key={f}
                className={`flex items-center gap-2 border-r border-border px-3 text-xs ${
                  active === f
                    ? "border-t-2 border-t-pink bg-tab-active text-foreground"
                    : "border-t-2 border-t-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActive(f)}
                  className="flex items-center gap-2"
                >
                  <FileIcon name={f} className="size-3.5" />
                  {f}
                </button>

                <button
                  type="button"
                  onClick={() => closeTab(f)}
                  aria-label={`Fermer ${f}`}
                >
                  <X className="size-3 opacity-60 hover:opacity-100" />
                </button>
              </div>
            ))}
          </div>

          {/* Breadcrumb */}
          <div className="flex h-6 shrink-0 items-center gap-2 border-b border-border px-4 text-[11px] text-muted-foreground">
            khemiri-nour
            <span>›</span>
            src
            <span>›</span>

            <span className="flex items-center gap-1.5 text-foreground/80">
              <FileIcon name={active} className="size-3" />
              {active}
            </span>
          </div>

          {/* Contenu du fichier */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {active === "home.tsx" && (
              <HomePane onOpen={openFile} />
            )}

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
              onOpen={openFile}
              onClose={() => setTerminal(false)}
            />
          )}
        </main>
      </div>

      {/* Status bar */}
      <div className="flex h-6 shrink-0 items-center justify-between bg-status px-3 text-[11px] text-status-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <GitBranch className="size-3" />
            main
          </span>

          <span className="flex items-center gap-1">
            <Circle className="size-2" />
            Portfolio de Nour
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline">UTF-8</span>

          <span className="hidden md:inline">Prettier</span>

          <span>Nour Dark</span>

          <span
            className="flex items-center gap-1 tabular-nums"
            aria-label={`Heure locale ${time}`}
          >
            <Clock3 className="size-3" />
            {time}
          </span>

          <Bell className="size-3" />
        </div>
      </div>
    </div>
  </div> 
  );


}