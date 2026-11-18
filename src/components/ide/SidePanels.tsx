import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Blocks,
  Bug,
  CaseSensitive,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GitCommitHorizontal,
  Play,
  RefreshCw,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { FileIcon } from "./FileIcon";
import { clubs, education, experiences, languages, profile, projects, skills } from "./data";

/* ------------------------------------------------------------------ */
/* Index de recherche : quel texte se trouve dans quel "fichier"       */
/* ------------------------------------------------------------------ */

const searchIndex: Record<string, string[]> = {
  "home.tsx": [`${profile.first} ${profile.last}`, ...profile.tags, profile.typed, profile.intro],
  "about.html": [
    profile.intro,
    ...education.map((e) => `${e.degree} — ${e.school} (${e.period})`),
    ...languages.map((l) => `${l.name} : ${l.level}`),
    ...clubs,
  ],
  "projects.js": projects.flatMap((p) => [
    p.role,
    p.summary,
    ...(p.bullets ?? []),
    p.stack.join(", "),
  ]),
  "skills.json": skills.flatMap((s) => s.items),
  "experience.ts": experiences.flatMap((e) => [
    `${e.company} — ${e.role}`,
    e.period,
    e.summary,
    ...e.bullets,
    e.stack.join(", "),
  ]),
  "contact.css": [
    profile.email,
    profile.phone,
    profile.location,
    profile.github,
    profile.linkedin,
    profile.kaggle,
  ],
  "README.md": [
    "Portfolio interactif façon VS Code",
    "Utilisez l'explorateur, le terminal ou la palette de commandes pour naviguer.",
  ],
};

/* ------------------------------------------------------------------ */
/* Briques communes                                                    */
/* ------------------------------------------------------------------ */

export function PanelHeader({
  title,
  actions,
  onClose,
}: {
  title: string;
  actions?: ReactNode;
  onClose?: (() => void) | undefined;
}) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between px-4 text-[11px] tracking-[0.12em] text-muted-foreground">
      <span className="truncate">{title}</span>
      <div className="flex items-center gap-1">
        {actions}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le panneau"
            className="rounded p-0.5 hover:bg-sidebar-active hover:text-foreground md:hidden"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-1 px-2 py-1 text-[11px] font-bold tracking-[0.08em] text-foreground/80 hover:bg-sidebar-active"
      >
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        <span className="flex-1 text-left">{title}</span>
        {badge !== undefined && (
          <span className="rounded-full bg-muted px-1.5 text-[10px] font-normal text-foreground/80">
            {badge}
          </span>
        )}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <>{text}</>;
  const start = Math.max(0, i - 24);
  return (
    <>
      {start > 0 && "…"}
      {text.slice(start, i)}
      <mark className="rounded-[2px] bg-code-num/35 text-foreground">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* RECHERCHE                                                           */
/* ------------------------------------------------------------------ */

export function SearchPanel({
  onOpen,
  onClose,
}: {
  onOpen: (f: string) => void;
  onClose?: (() => void) | undefined;
}) {
  const [q, setQ] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const results = useMemo(() => {
    const query = q.trim();
    if (query.length < 2) return [];
    const norm = (s: string) => (caseSensitive ? s : s.toLowerCase());
    const nq = norm(query);
    return Object.entries(searchIndex)
      .map(([file, lines]) => ({
        file,
        lines: Array.from(new Set(lines)).filter((l) => norm(l).includes(nq)),
      }))
      .filter((r) => r.lines.length);
  }, [q, caseSensitive]);

  const total = results.reduce((n, r) => n + r.lines.length, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader
        title="RECHERCHER"
        onClose={onClose}
        actions={
          <button
            type="button"
            title="Effacer les résultats"
            onClick={() => setQ("")}
            className="rounded p-0.5 hover:bg-sidebar-active hover:text-foreground"
          >
            <RefreshCw className="size-3.5" />
          </button>
        }
      />
      <div className="px-3 pb-2">
        <div className="flex items-center gap-1 rounded-sm border border-border bg-editor px-2 focus-within:border-primary">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (ex : Docker, PFE, Python)"
            aria-label="Rechercher dans le portfolio"
            className="min-w-0 flex-1 bg-transparent py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            title="Respecter la casse"
            aria-pressed={caseSensitive}
            onClick={() => setCaseSensitive((c) => !c)}
            className={`rounded-sm p-0.5 ${caseSensitive ? "bg-primary/30 text-foreground ring-1 ring-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <CaseSensitive className="size-3.5" />
          </button>
        </div>
        {q.trim().length >= 2 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {total
              ? `${total} résultat${total > 1 ? "s" : ""} dans ${results.length} fichier${results.length > 1 ? "s" : ""}`
              : "Aucun résultat."}
          </p>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {results.map((r) => (
          <div key={r.file}>
            <button
              type="button"
              onClick={() => onOpen(r.file)}
              className="flex w-full items-center gap-1.5 px-3 py-1 text-left text-[13px] text-foreground hover:bg-sidebar-active"
            >
              <ChevronDown className="size-3.5 text-muted-foreground" />
              <FileIcon name={r.file} className="size-3.5 shrink-0" />
              <span className="flex-1 truncate">{r.file}</span>
              <span className="rounded-full bg-muted px-1.5 text-[10px] text-foreground/80">
                {r.lines.length}
              </span>
            </button>
            {r.lines.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onOpen(r.file)}
                className="block w-full truncate py-0.5 pl-10 pr-3 text-left text-[12px] text-sidebar-foreground hover:bg-sidebar-active hover:text-foreground"
                title={l}
              >
                <Highlight text={l} query={q.trim()} />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CONTRÔLE DE CODE SOURCE (envoyer un message + historique)           */
/* ------------------------------------------------------------------ */

const changes: { file: string; status: "M" | "U" }[] = [
  { file: "projects.js", status: "M" },
  { file: "skills.json", status: "M" },
  { file: "experience.ts", status: "U" },
];

export function SourceControlPanel({
  onOpen,
  onClose,
}: {
  onOpen: (f: string) => void;
  onClose?: (() => void) | undefined;
}) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const commits = [
    ...experiences.map((e) => ({
      title: `feat: ${e.company} — ${e.role}`,
      date: e.period,
      file: "experience.ts",
    })),
    ...education.map((e) => ({ title: `docs: ${e.degree}`, date: e.period, file: "about.html" })),
  ];

  const send = () => {
    if (!msg.trim()) return;
    const url = `mailto:${profile.email}?subject=${encodeURIComponent("Contact depuis le portfolio")}&body=${encodeURIComponent(msg)}`;
    window.location.href = url;
    setSent(true);
    setMsg("");
    window.setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title="CONTRÔLE DE CODE SOURCE" onClose={onClose} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-3 pb-3">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            rows={3}
            placeholder={"Message pour Nour"}
            aria-label="Message à envoyer"
            className="w-full resize-none rounded-sm border border-border bg-editor px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="button"
            onClick={send}
            disabled={!msg.trim()}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-sm bg-primary py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {sent ? <Check className="size-3.5" /> : <SendHorizontal className="size-3.5" />}
            {sent ? "Client mail ouvert !" : "Commit & Envoyer"}
          </button>
        </div>

        <Section title="MODIFICATIONS" badge={changes.length}>
          {changes.map((c) => (
            <button
              key={c.file}
              type="button"
              onClick={() => onOpen(c.file)}
              className="flex w-full items-center gap-2 py-1 pl-6 pr-3 text-left text-[13px] text-sidebar-foreground hover:bg-sidebar-active hover:text-foreground"
            >
              <FileIcon name={c.file} className="size-3.5 shrink-0" />
              <span className="flex-1 truncate">{c.file}</span>
              <span className={c.status === "M" ? "text-code-num" : "text-code-comment"}>
                {c.status}
              </span>
            </button>
          ))}
        </Section>

        <Section title="GRAPHIQUE">
          <ol className="relative ml-6 border-l border-pink/40">
            {commits.map((c) => (
              <li key={c.title}>
                <button
                  type="button"
                  onClick={() => onOpen(c.file)}
                  className="group relative flex w-full items-start gap-2 py-1 pl-3 pr-3 text-left hover:bg-sidebar-active"
                  title={c.title}
                >
                  <GitCommitHorizontal className="absolute -left-[7px] top-1.5 size-3.5 rounded-full bg-sidebar text-pink" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] text-foreground/90 group-hover:text-foreground">
                      {c.title}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">{c.date}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EXÉCUTER ET DÉBOGUER                                                */
/* ------------------------------------------------------------------ */

export function RunPanel({
  onRun,
  onOpen,
  onClose,
}: {
  onRun: (cmd: string) => void;
  onOpen: (f: string) => void;
  onClose?: (() => void) | undefined;
}) {
  const [config, setConfig] = useState("npm run dev");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title="EXÉCUTER ET DÉBOGUER" onClose={onClose} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-center gap-1 px-3 pb-3">
          <button
            type="button"
            title="Démarrer"
            onClick={() => onRun(config)}
            className="flex size-7 shrink-0 items-center justify-center rounded-sm text-code-comment hover:bg-sidebar-active"
          >
            <Play className="size-4 fill-current" />
          </button>
          <select
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            aria-label="Configuration de lancement"
            className="min-w-0 flex-1 rounded-sm border border-border bg-editor px-1.5 py-1 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="npm run dev">Lancer le portfolio</option>
            <option value="whoami">Qui suis-je ?</option>
            <option value="git log">Historique (git log)</option>
            <option value="skills">Compétences</option>
          </select>
        </div>
        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={() => onRun(config)}
            className="w-full rounded-sm bg-primary py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
          >
            Exécuter et déboguer
          </button>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            Lance la configuration choisie dans le terminal intégré.
          </p>
        </div>

        <Section title="PROJETS (LAUNCH.JSON)">
          {projects.map((p) => (
            <div
              key={p.role}
              className="group flex items-center gap-2 py-1 pl-6 pr-3 text-[12px] text-sidebar-foreground hover:bg-sidebar-active"
            >
              <Bug className="size-3.5 shrink-0 text-code-kw" />
              <button
                type="button"
                onClick={() => onOpen("projects.js")}
                className="min-w-0 flex-1 truncate text-left hover:text-foreground"
                title={p.summary}
              >
                {p.role.split("—").pop()?.trim()}
              </button>
              {p.repo && (
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                  title="Voir sur GitHub"
                  className="opacity-60 hover:text-foreground hover:opacity-100"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          ))}
        </Section>
        <Section title="POINTS D'ARRÊT" defaultOpen={false}>
          <p className="px-6 text-[11px] text-muted-foreground">Aucun bug ici 😉</p>
        </Section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EXTENSIONS = compétences installées                                 */
/* ------------------------------------------------------------------ */

const prettify = (key: string) =>
  key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export function ExtensionsPanel({
  onOpen,
  onClose,
}: {
  onOpen: (f: string) => void;
  onClose?: (() => void) | undefined;
}) {
  const [q, setQ] = useState("");
  const list = skills
    .map((s) => ({ name: s.category ?? prettify(s.key), items: s.items }))
    .filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.items.some((i) => i.toLowerCase().includes(q.toLowerCase())),
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title="EXTENSIONS" onClose={onClose} />
      <div className="px-3 pb-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher une compétence…"
          aria-label="Rechercher une compétence"
          className="w-full rounded-sm border border-border bg-editor px-2 py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section title="INSTALLÉES" badge={list.length}>
          {list.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => onOpen("skills.json")}
              className="flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-sidebar-active"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-pink/80 to-primary/80 text-primary-foreground">
                <Blocks className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-foreground">
                  {s.name}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {s.items.join(" · ")}
                </span>
                <span className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Nour Khémiri</span>
                  <span className="text-code-comment">{s.items.length} modules</span>
                </span>
              </span>
            </button>
          ))}
        </Section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ASSISTANT (chat local, sans API)                                    */
/* ------------------------------------------------------------------ */

type Msg = { from: "me" | "bot"; text: string; file?: string };

function answer(q: string): Msg {
  const t = q.toLowerCase();
  const has = (...k: string[]) => k.some((w) => t.includes(w));
  if (has("contact", "mail", "email", "téléphone", "telephone", "phone", "joindre"))
    return {
      from: "bot",
      text: `Vous pouvez joindre Nour à ${profile.email} ou au ${profile.phone}.`,
      file: "contact.css",
    };
  if (has("projet", "project", "github", "repo"))
    return {
      from: "bot",
      text: `Nour a réalisé ${projects.length} projets majeurs, dont une marketplace Nx/NestJS et un pipeline de détection d'attaques adversariales.`,
      file: "projects.js",
    };
  if (has("expérience", "experience", "stage", "pfe", "travail", "job"))
    return {
      from: "bot",
      text: experiences.map((e) => `• ${e.company} (${e.period})`).join("\n"),
      file: "experience.ts",
    };
  if (
    has(
      "compétence",
      "competence",
      "skill",
      "stack",
      "techno",
      "python",
      "docker",
      "ia",
      "ml",
      "rag",
      "llm",
    )
  )
    return {
      from: "bot",
      text: `Domaines : ${skills.map((s) => s.category ?? prettify(s.key)).join(", ")}.`,
      file: "skills.json",
    };
  if (
    has(
      "étude",
      "etude",
      "diplôme",
      "diplome",
      "master",
      "licence",
      "formation",
      "école",
      "faculté",
    )
  )
    return {
      from: "bot",
      text: education.map((e) => `• ${e.degree} (${e.period})`).join("\n"),
      file: "about.html",
    };
  if (has("langue", "language", "anglais", "français", "arabe"))
    return {
      from: "bot",
      text: languages.map((l) => `${l.name} : ${l.level}`).join(" · "),
      file: "about.html",
    };
  if (has("où", "ou habite", "location", "ville", "tunisie"))
    return { from: "bot", text: `Nour est basée à ${profile.location}.` };
  if (has("cv", "resume", "résumé"))
    return {
      from: "bot",
      text: "Le CV est téléchargeable depuis le menu Compte (icône en bas à gauche) ou la commande `cv` du terminal.",
    };
  if (has("bonjour", "salut", "hello", "hi", "coucou"))
    return {
      from: "bot",
      text: `Bonjour ! Je suis l'assistant du portfolio de ${profile.first} ${profile.last}. Posez-moi une question.`,
    };
  return {
    from: "bot",
    text: "Je n'ai pas compris 🤔 Essayez : projets, compétences, expérience, formation, langues ou contact.",
  };
}

const suggestions = ["Quels sont ses projets ?", "Ses compétences ?", "Comment la contacter ?"];

export function ChatPanel({
  onOpen,
  onClose,
}: {
  onOpen: (f: string) => void;
  onClose?: (() => void) | undefined;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: `👋 Bonjour ! Posez-moi une question sur le parcours de ${profile.first}.`,
    },
  ]);
  const [v, setV] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: q }, answer(q)]);
    setV("");
    window.setTimeout(() => endRef.current?.scrollIntoView({ block: "end" }), 30);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title="ASSISTANT" onClose={onClose} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.from === "me" ? "flex justify-end" : ""}>
            <div
              className={`max-w-[90%] whitespace-pre-line rounded-md px-2.5 py-1.5 text-[12px] leading-5 ${
                m.from === "me"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground/90"
              }`}
            >
              {m.from === "bot" && <Sparkles className="mb-0.5 mr-1 inline size-3 text-pink" />}
              {m.text}
              {m.file && (
                <button
                  type="button"
                  onClick={() => onOpen(m.file!)}
                  className="mt-1 flex items-center gap-1 text-[11px] text-code-key hover:underline"
                >
                  <FileIcon name={m.file} className="size-3" /> Ouvrir {m.file}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex flex-wrap gap-1 px-3 pb-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => ask(s)}
            className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:border-pink hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(v);
        }}
        className="mx-3 mb-3 flex items-center gap-1 rounded-sm border border-border bg-editor px-2 focus-within:border-primary"
      >
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="Poser une question…"
          aria-label="Question pour l'assistant"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Envoyer"
          className="text-muted-foreground hover:text-pink"
        >
          <SendHorizontal className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
