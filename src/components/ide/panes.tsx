import { useEffect, useState } from "react";
import React from "react";
import {
  Award,
  Braces,
  Building2,
  Github,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  MousePointerClick,
  Phone,
  Globe,
  Terminal,
  Users,
  FileText,
  Trophy,
} from "lucide-react";
import cvAsset from "@/assets/cv.pdf.asset.json";
import {
  clubs,
  education,
  experiences,
  languages,
  profile,
  skills,
  stats,
} from "./data";

export function CodeLines({ children }: { children: React.ReactNode[] }) {
  return (
    <div className="flex gap-4 font-mono text-[13px] leading-6">
      <div className="select-none text-right text-muted-foreground/60">
        {children.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        {children.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function Comment({ children }: { children: React.ReactNode }) {
  return <span className="text-code-comment">{children}</span>;
}

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v >= text.length ? 0 : v + 1)), 90);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span className="text-code-string">
      <span className="caret pr-0.5">{text.slice(0, n)}</span>
    </span>
  );
}

const links = [
  { icon: Github, label: "GitHub", href: profile.github },
  { icon: Linkedin, label: "LinkedIn", href: profile.linkedin },
  { icon: Globe, label: "portfolio", href: profile.site },
  { icon: Trophy, label: "Kaggle", href: profile.kaggle },
  { icon: Mail, label: "Email", href: `mailto:${profile.email}` },
];

export function HomePane({ onOpen }: { onOpen: (f: string) => void }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14 md:px-10">
      <p className="text-code-comment">
        {"// hello world !! Bienvenue sur mon portfolio"}
      </p>
      <h1 className="mt-5 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
        <span className="block text-foreground">{profile.first}</span>
        <span className="block text-pink">{profile.last}</span>
      </h1>
      <div className="mt-6 h-px w-full bg-border" />
      <div className="mt-5 flex flex-wrap gap-2">
        {profile.tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-foreground/90"
          >
            <span className="size-1.5 rounded-full bg-pink" />
            {t}
          </span>
        ))}
      </div>
      <p className="mt-6 text-sm">
        <Typewriter text={profile.typed} />
      </p>
      <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
        {profile.intro}
      </p>

      <p className="mt-8 flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground">
        <MousePointerClick className="size-3.5 text-pink" aria-hidden />
        Astuce : ces boutons sont cliquables, essayez-les !
      </p>
      <div data-tour="home-actions" className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onOpen("experience.ts")}
          title="Ouvrir la section Expériences"
          className="rounded-sm bg-primary px-4 py-2 text-xs text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80"
        >
          {"</> Expériences"}
        </button>
        <button
          type="button"
          onClick={() => onOpen("skills.json")}
          title="Ouvrir la section Compétences"
          className="rounded-sm border border-border px-4 py-2 text-xs text-foreground transition-colors hover:bg-accent active:bg-accent/70"
        >
          {"{ } Compétences"}
        </button>
        <button
          type="button"
          onClick={() => onOpen("contact.css")}
          title="Ouvrir la section Contact"
          className="rounded-sm border border-border px-4 py-2 text-xs text-foreground transition-colors hover:bg-accent active:bg-accent/70"
        >
          ✉ Contact
        </button>
        <a
          href={cvAsset.url}
          download="CV-Khemiri-Nour-Elwoujoud.pdf"
          target="_blank"
          rel="noreferrer"
          title="Télécharger le CV au format PDF"
          className="inline-flex items-center gap-2 rounded-sm border border-pink px-4 py-2 text-xs text-pink transition-colors hover:bg-pink hover:text-primary-foreground"
        >
          <FileText className="size-3.5" /> CV (PDF)
        </a>
      </div>

      <div className="mt-10 grid grid-cols-2 divide-border rounded-sm border border-border bg-card sm:grid-cols-4 sm:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-6 text-center">
            <div className="font-display text-2xl text-foreground">{s.value}</div>
            <div className="mt-1 text-[10px] tracking-[0.2em] text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <l.icon className="size-3.5" />
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export function AboutPane() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <CodeLines>
        {[
          <Comment key="c">{"<!-- about.html -->"}</Comment>,
          <span key="1" className="text-code-key">{"<section id=\"profil\">"}</span>,
          <span key="2" className="ml-6 block max-w-2xl text-sm leading-7 text-foreground/90">
            {profile.intro}
          </span>,
          <span key="3" className="text-code-key">{"</section>"}</span>,
        ]}
      </CodeLines>

      <h2 className="mt-12 flex items-center gap-2 text-sm tracking-[0.2em] text-pink">
        <GraduationCap className="size-4" /> FORMATION
      </h2>
      <div className="mt-4 space-y-3">
        {education.map((e) => (
          <div key={e.degree} className="rounded-sm border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm text-foreground">{e.degree}</span>
              <span className="text-xs text-code-comment">{e.period}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{e.school}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 flex items-center gap-2 text-sm tracking-[0.2em] text-pink">
        <Languages className="size-4" /> LANGUES
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {languages.map((l) => (
          <div key={l.name} className="rounded-sm border border-border bg-card p-4">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-foreground">{l.name}</span>
              <span className="text-muted-foreground">{l.level}</span>
            </div>
            <div className="mt-3 h-1 w-full rounded-full bg-muted">
              <div className="h-1 rounded-full bg-pink" style={{ width: `${l.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 flex items-center gap-2 text-sm tracking-[0.2em] text-pink">
        <Users className="size-4" /> PARCOURS ASSOCIATIF
      </h2>
      <ul className="mt-4 space-y-2">
        {clubs.map((c) => (
          <li key={c} className="flex gap-3 text-sm text-muted-foreground">
            <Award className="mt-0.5 size-4 shrink-0 text-code-fn" />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillsPane() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <p className="text-code-comment">{"// skills.json"}</p>
      <p className="mt-4 text-code-key">{"{"}</p>
      <div className="mt-4 space-y-4 pl-4 md:pl-8">
        {skills.map((group) => (
          <div key={group.key} className="rounded-sm border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm">
              <Braces className="size-4 text-code-fn" />
              <span className="text-code-key">&quot;{group.key}&quot;</span>
              <span className="text-muted-foreground">: [</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.items.map((i) => (
                <span
                  key={i}
                  className="rounded-sm border border-border bg-editor px-2.5 py-1 text-xs text-code-string transition-colors hover:border-pink hover:text-foreground"
                >
                  &quot;{i}&quot;
                </span>
              ))}
            </div>
            <div className="mt-3 text-muted-foreground">],</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-code-key">{"}"}</p>
    </div>
  );
}

export function ExperiencePane() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <p className="text-code-comment">{"// experience.ts"}</p>
      <div className="mt-6 space-y-4">
        {experiences.map((e) => (
          <article key={e.company} className="rounded-sm border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base text-foreground">
                <Building2 className="size-4 text-pink" />
                {e.company}
                <span className="text-xs text-muted-foreground">— {e.place}</span>
              </h3>
              <span className="text-xs text-code-comment">{e.period}</span>
            </div>
            <p className="mt-2 text-sm text-code-fn">{e.role}</p>
            <p className="mt-3 text-sm leading-7 text-foreground/90">{e.summary}</p>
            <ul className="mt-3 space-y-2">
              {e.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span className="text-pink">▹</span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {e.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-sm border border-border px-2 py-1 text-[11px] text-code-key"
                >
                  {s}
                </span>
              ))}
              {e.repo && (
                <a
                  href={e.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 text-xs text-code-string underline-offset-4 hover:underline"
                >
                  <Github className="size-3.5" /> Voir le code
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ProjectsPane() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <p className="text-code-comment">{"// projects.js"}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {experiences.map((e, i) => (
          <div key={e.company} className="rounded-sm border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Terminal className="size-3.5 text-code-fn" />
              projet_{String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="mt-3 text-sm text-foreground">{e.summary}</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {e.company} · {e.period}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {e.stack.map((s) => (
                <span key={s} className="text-[11px] text-code-string">
                  #{s.toLowerCase().replace(/[^a-z0-9]/g, "")}
                </span>
              ))}
            </div>
            {e.repo && (
              <a
                href={e.repo}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-pink underline-offset-4 hover:underline"
              >
                <Github className="size-3.5" /> Voir sur GitHub
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactPane() {
  const rows: {
    icon: typeof Mail;
    prop: string;
    value: string;
    href?: string;
    download?: string;
  }[] = [
    { icon: Mail, prop: "email", value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, prop: "téléphone", value: profile.phone, href: `tel:+21622880524` },
    { icon: Github, prop: "github", value: "github.com/khemirinour", href: profile.github },
    { icon: Linkedin, prop: "linkedin", value: "nour-woujoud-khémiri", href: profile.linkedin },
    { icon: Globe, prop: "site", value: "khemirinourportfolio.vercel.app", href: profile.site },
    { icon: Trophy, prop: "kaggle", value: "kaggle.com/khmirinourelwoujoud", href: profile.kaggle },
    {
      icon: FileText,
      prop: "cv",
      value: "télécharger le CV (PDF)",
      href: cvAsset.url,
      download: "CV-Khemiri-Nour-Elwoujoud.pdf",
    },
    { icon: MapPin, prop: "localisation", value: profile.location },
  ];
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <p className="text-code-comment">{"/* contact.css */"}</p>
      <p className="mt-4 text-code-fn">
        .contact <span className="text-muted-foreground">{"{"}</span>
      </p>
      <div className="mt-4 space-y-2 pl-4 md:pl-8">
        {rows.map((r) => (
          <div
            key={r.prop}
            className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-card px-4 py-3"
          >
            <r.icon className="size-4 text-pink" />
            <span className="text-xs text-code-key">--{r.prop}:</span>
            {r.href ? (
              <a
                href={r.href}
                download={r.download}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-code-string underline-offset-4 hover:underline"
              >
                {r.value}
              </a>
            ) : (
              <span className="text-sm text-code-string">{r.value}</span>
            )}
            <span className="text-muted-foreground">;</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-muted-foreground">{"}"}</p>

      {/*
        Formulaire de contact via Formspree (gratuit) : crée un formulaire sur
        https://formspree.io, remplace FORM_ID ci-dessous par le tien.
        Sans ça, seul le mailto ci-dessus fonctionne (ce qui n'ouvre pas
        d'application mail sur tous les appareils).
      */}
      <div className="mt-10 rounded-sm border border-border bg-card p-5">
        <p className="text-xs text-code-comment">{"// envoyer un message directement"}</p>
        <form
          action="https://formspree.io/f/FORM_ID"
          method="POST"
          className="mt-4 space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-[11px] text-muted-foreground">
                Nom
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                className="w-full rounded-sm border border-border bg-editor px-3 py-2 text-sm text-foreground outline-none focus:border-pink"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block text-[11px] text-muted-foreground">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                className="w-full rounded-sm border border-border bg-editor px-3 py-2 text-sm text-foreground outline-none focus:border-pink"
              />
            </div>
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1 block text-[11px] text-muted-foreground">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              required
              className="w-full resize-none rounded-sm border border-border bg-editor px-3 py-2 text-sm text-foreground outline-none focus:border-pink"
            />
          </div>
          <button
            type="submit"
            className="rounded-sm bg-primary px-4 py-2 text-xs text-primary-foreground transition-opacity hover:opacity-90"
          >
            Envoyer le message
          </button>
        </form>
      </div>
    </div>
  );
}

export function ReadmePane() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <h1 className="font-display text-2xl text-foreground">
        # {profile.first} {profile.last}
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{profile.intro}</p>
      <h2 className="mt-8 text-sm text-pink">## Stack principale</h2>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {["Python / PyTorch / TensorFlow", "Docker / Kubernetes / GitLab CI", "PostgreSQL / MySQL / Spark", "Pentesting / OWASP / SOC"].map(
          (s) => (
            <li key={s}>- {s}</li>
          ),
        )}
      </ul>
      <h2 className="mt-8 text-sm text-pink">## Contact</h2>
      <p className="mt-3 text-sm text-code-string">{profile.email}</p>
      <p className="mt-2 text-sm">
        <a
          href={cvAsset.url}
          download="CV-Khemiri-Nour-Elwoujoud.pdf"
          target="_blank"
          rel="noreferrer"
          className="text-code-string underline-offset-4 hover:underline"
        >
          - CV (PDF)
        </a>
      </p>
    </div>
  );
}
