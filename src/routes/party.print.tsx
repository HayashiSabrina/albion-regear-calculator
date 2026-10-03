import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { PartyPrintSheet } from "@/components/party/PartyPrintSheet";
import { Button } from "@/components/ui/button";
import { useAlbionData } from "@/hooks/useAlbionData";
import { listParties, type Party } from "@/lib/albion/parties";

const CAPTURE_ID = "party-builds-image";

export const Route = createFileRoute("/party/print")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? search["id"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Imagem da composição — Party Builds" },
      { name: "description", content: "Visualização horizontal das builds de uma composição do Albion Online." },
      { property: "og:title", content: "Imagem da composição — Party Builds" },
      { property: "og:description", content: "Visualização horizontal das builds de uma composição do Albion Online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PartyImagePage,
});

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "party-builds";
}

async function waitForImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

function PartyImagePage() {
  const { id } = Route.useSearch();
  const { itemIndex, loading: itemsLoading } = useAlbionData();
  const [party, setParty] = useState<Party | null>(null);
  const [partyLoaded, setPartyLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    listParties()
      .then((parties) => {
        if (active) setParty(parties.find((entry) => entry.id === id) ?? null);
      })
      .finally(() => {
        if (active) setPartyLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const downloadPng = async () => {
    if (!party) return;
    const sheet = document.getElementById(CAPTURE_ID);
    if (!sheet) return;

    setDownloading(true);
    try {
      await waitForImages(sheet);
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(sheet, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#171612",
      });
      const link = document.createElement("a");
      link.download = `${safeFileName(party.name)}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const loading = !partyLoaded || itemsLoading;

  return (
    <main className="min-h-screen bg-background px-4 py-5">
      <div className="mx-auto mb-4 flex max-w-[1600px] items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link to="/party">
            <ArrowLeft /> Voltar
          </Link>
        </Button>
        {party && (
          <Button onClick={() => void downloadPng()} disabled={downloading}>
            {downloading ? <LoaderCircle className="animate-spin" /> : <Download />}
            {downloading ? "Gerando PNG…" : "Baixar PNG"}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="mx-auto max-w-[1600px] py-24 text-center text-muted-foreground">Carregando composição…</div>
      ) : party ? (
        <div className="party-image-stage mx-auto max-w-[1600px] overflow-x-auto">
          <PartyPrintSheet party={party} itemIndex={itemIndex} captureId={CAPTURE_ID} />
        </div>
      ) : (
        <div className="mx-auto max-w-[1600px] py-24 text-center text-muted-foreground">Composição não encontrada.</div>
      )}
    </main>
  );
}