import { createFileRoute } from "@tanstack/react-router";
import { IdeShell } from "@/components/ide/IdeShell";

const title = "Khémiri Nour Elwoujoud";
const description = "Portfolio de Khémiri Nour Elwoujoud";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <IdeShell />;
}
