import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/party")({
  head: () => ({
    meta: [
      { title: "Party Builds — Regear Forge" },
      { name: "description", content: "Composições e imagens de builds para parties do Albion Online." },
      { property: "og:title", content: "Party Builds — Regear Forge" },
      { property: "og:description", content: "Composições e imagens de builds para parties do Albion Online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PartyLayout,
});

function PartyLayout() {
  return <Outlet />;
}