import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [pngError, setPngError] = useState<string | null>(null);
  const [autoGenerateAttempted, setAutoGenerateAttempted] = useState(false);

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

  const generatePng = useCallback(async () => {
    if (!party) return null;
    const sheet = document.getElementById(CAPTURE_ID);
    if (!sheet) return null;

    setDownloading(true);
    setPngError(null);
    try {
      await waitForImages(sheet);
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(sheet, {
        cacheBust: false,
        pixelRatio: 1.5,
        backgroundColor: "#171612",
      });
      setPngUrl(dataUrl);
      return dataUrl;
    } catch {
      setPngError("Não foi possível gerar a imagem. Tente novamente.");
      return null;
    } finally {
      setDownloading(false);
    }
  }, [party]);

  useEffect(() => {
    if (!party || itemsLoading || pngUrl || downloading || autoGenerateAttempted) return;
    setAutoGenerateAttempted(true);
    const frame = window.requestAnimationFrame(() => void generatePng());
    return () => window.cancelAnimationFrame(frame);
  }, [autoGenerateAttempted, downloading, generatePng, itemsLoading, party, pngUrl]);

  const downloadPng = async () => {
    if (!party) return;
    const dataUrl = pngUrl ?? await generatePng();
    if (!dataUrl) return;
    try {
      const link = document.createElement("a");
      link.download = `${safeFileName(party.name)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setPngError("Não foi possível baixar a imagem. Tente novamente.");
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
        <>
          {pngError && <p className="mx-auto mb-4 max-w-[1600px] text-sm text-destructive">{pngError}</p>}
          <div className="party-image-stage mx-auto max-w-[1600px] overflow-x-auto">
            {pngUrl ? (
              <img src={pngUrl} alt={`Composição ${party.name}`} className="block h-auto w-[1600px] max-w-none" />
            ) : (
              <PartyPrintSheet party={party} itemIndex={itemIndex} captureId={CAPTURE_ID} />
            )}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-[1600px] py-24 text-center text-muted-foreground">Composição não encontrada.</div>
      )}
    </main>
  );
}