import { createFileRoute } from "@tanstack/react-router";
import { Copy, Database, Pencil, Save, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ItemPicker } from "@/components/regear/ItemPicker";
import { MarketPanel } from "@/components/regear/MarketPanel";
import { RegearSidebar } from "@/components/regear/RegearSidebar";
import { RegearTable } from "@/components/regear/RegearTable";
import { RequirementsPanel } from "@/components/regear/RequirementsPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlbionData } from "@/hooks/useAlbionData";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { useRegears } from "@/hooks/useRegears";
import { calculateCraftingRequirements } from "@/lib/albion/crafting";
import { formatDate, formatNumber } from "@/lib/albion/format";
import {
  newestMarketDate,
  type MarketLocation,
  type MarketServer,
} from "@/lib/albion/market";
import { addLine, removeLine, setLineQuantity } from "@/lib/albion/regears";
import type { RegearLine } from "@/lib/albion/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Regear Forge — Calculadora de crafting do Albion Online" },
      {
        name: "description",
        content: "Monte regears do Albion Online e calcule recursos e artefatos de crafting.",
      },
      { property: "og:title", content: "Regear Forge — Calculadora de crafting" },
      {
        property: "og:description",
        content: "Calcule e gerencie materiais de crafting para regears do Albion Online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { dataset, itemIndex, loading, fromCache, error } = useAlbionData();
  const { regears, active, activeId, setActiveId, ready, create, update, duplicate, remove } =
    useRegears();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [marketServer, setMarketServer] = useState<MarketServer>("west");
  const [marketLocation, setMarketLocation] = useState<MarketLocation>("Caerleon");

  useEffect(() => {
    setName(active?.name ?? "");
    setEditingName(false);
  }, [active?.id, active?.name]);

  useEffect(() => {
    const savedServer = window.localStorage.getItem("albion-market-server") as MarketServer | null;
    const savedLocation = window.localStorage.getItem("albion-market-location") as MarketLocation | null;
    if (savedServer) setMarketServer(savedServer);
    if (savedLocation) setMarketLocation(savedLocation);
  }, []);

  const result = useMemo(
    () => calculateCraftingRequirements(active?.lines ?? [], dataset, itemIndex),
    [active?.lines, dataset, itemIndex],
  );
  const marketItemIds = useMemo(
    () => [
      ...(active?.lines.map((line) => line.itemId) ?? []),
      ...result.resourceGroups.flatMap((group) => group.rows.map((row) => row.id)),
      ...result.artifacts.map((row) => row.id),
    ],
    [active?.lines, result],
  );
  const marketQuery = useMarketPrices(marketItemIds, marketServer, marketLocation);
  const marketPrices = useMemo(
    () => new Map((marketQuery.data ?? []).map((price) => [price.itemId, price])),
    [marketQuery.data],
  );
  const marketTotals = useMemo(() => {
    const rows = result.resourceGroups.flatMap((group) => group.rows).concat(result.artifacts);
    return rows.reduce(
      (totals, row) => {
        const price = marketPrices.get(row.id);
        totals.buy += (price?.sellPriceMin ?? 0) * row.quantity;
        totals.sell += (price?.buyPriceMax ?? 0) * row.quantity;
        return totals;
      },
      { buy: 0, sell: 0 },
    );
  }, [marketPrices, result]);

  const changeServer = (value: MarketServer) => {
    setMarketServer(value);
    window.localStorage.setItem("albion-market-server", value);
  };

  const changeLocation = (value: MarketLocation) => {
    setMarketLocation(value);
    window.localStorage.setItem("albion-market-location", value);
  };

  const saveName = () => {
    if (!active) return;
    void update({ ...active, name: name.trim() || "Novo Regear" });
    setEditingName(false);
  };

  const updateLines = (lines: RegearLine[]) => {
    if (active) void update({ ...active, lines });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-[1680px] gap-4 p-3 sm:p-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <RegearSidebar
          regears={regears}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={(newName) => void create(newName)}
          onToggleFavorite={(regear) => void update({ ...regear, favorite: !regear.favorite })}
        />

        <div className="min-w-0 space-y-4">
          <header className="panel px-4 py-4 sm:px-5">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div className="min-w-0">
                {active && editingName ? (
                  <div className="flex max-w-xl items-center gap-2">
                    <Input
                      value={name}
                      autoFocus
                      aria-label="Nome do regear"
                      onChange={(event) => setName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveName();
                        if (event.key === "Escape") setEditingName(false);
                      }}
                      className="text-lg font-semibold"
                    />
                    <Button size="icon" onClick={saveName} aria-label="Salvar nome">
                      <Save />
                    </Button>
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-2">
                    <h1 className="truncate text-xl font-bold sm:text-2xl">
                      {active?.name ?? "Calculadora de Regear"}
                    </h1>
                    {active?.favorite && <Star className="size-4 shrink-0 fill-primary text-primary" />}
                  </div>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {active ? (
                    <>
                      <span className="num">{formatNumber(result.totalItems)} equipamentos</span>
                      <span>Atualizado em {formatDate(active.updatedAt)}</span>
                    </>
                  ) : (
                    <span>Crie ou selecione um regear para começar.</span>
                  )}
                </div>
              </div>

              {active && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingName(true)}>
                    <Pencil /> Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void duplicate(active)}>
                    <Copy /> Duplicar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir “{active.name}”?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta configuração e todas as suas linhas serão removidas do navegador.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void remove(active.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir regear
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
              <Database className="size-4 text-primary" />
              {loading && !dataset ? (
                <span>Carregando a base completa de equipamentos…</span>
              ) : error && !dataset ? (
                <span className="text-destructive">Não foi possível carregar os dados: {error}</span>
              ) : dataset ? (
                <>
                  <span className="num">{formatNumber(dataset.items.length)} equipamentos disponíveis</span>
                  <span>Dados atualizados em {formatDate(dataset.generatedAt)}</span>
                  {fromCache && <span>Modo offline — usando cópia local</span>}
                </>
              ) : null}
            </div>
          </header>

          {!ready ? (
            <section className="panel py-16 text-center text-sm text-muted-foreground">
              Carregando seus regears…
            </section>
          ) : !active ? (
            <section className="panel py-16 text-center">
              <p className="text-sm font-medium">Nenhum regear selecionado</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Crie uma configuração na coluna lateral para começar.
              </p>
            </section>
          ) : (
            <>
              <MarketPanel
                server={marketServer}
                location={marketLocation}
                onServerChange={changeServer}
                onLocationChange={changeLocation}
                buyTotal={marketTotals.buy}
                sellTotal={marketTotals.sell}
                updatedAt={newestMarketDate(marketQuery.data ?? [])}
                loading={marketQuery.isFetching}
                error={marketQuery.isError}
                onRefresh={() => void marketQuery.refetch()}
              />
              <RegearTable
                lines={active.lines}
                itemIndex={itemIndex}
                prices={marketPrices}
                onQuantityChange={(itemId, quantity) =>
                  updateLines(setLineQuantity(active.lines, itemId, quantity))
                }
                onRemove={(itemId) => updateLines(removeLine(active.lines, itemId))}
              />
              <ItemPicker
                dataset={dataset}
                onAdd={(itemId, quantity) => updateLines(addLine(active.lines, itemId, quantity))}
              />
              <RequirementsPanel result={result} prices={marketPrices} />
              {result.unknownItemIds.length > 0 && (
                <p className="text-xs text-destructive">
                  {result.unknownItemIds.length} item(ns) não foram encontrados na base atual.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
