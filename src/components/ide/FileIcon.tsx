import { Braces, FileCode2, FileText, Hash, Code2 } from "lucide-react";

function ReactIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="-11.5 -10.23 23 20.46" className={className} aria-hidden="true">
      <circle r="2.05" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}

export function FileIcon({ name, className = "size-4" }: { name: string; className?: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
    case "jsx":
      return <ReactIcon className={`${className} text-code-key`} />;
    case "ts":
      return <FileCode2 className={`${className} text-code-key`} />;
    case "js":
      return <FileCode2 className={`${className} text-code-fn`} />;
    case "json":
      return <Braces className={`${className} text-code-fn`} />;
    case "css":
      return <Hash className={`${className} text-code-kw`} />;
    case "html":
      return <Code2 className={`${className} text-code-string`} />;
    case "md":
      return <FileText className={`${className} text-muted-foreground`} />;
    default:
      return <FileText className={`${className} text-muted-foreground`} />;
  }
}
