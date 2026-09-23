import { Clock3, RefreshCw, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MARKET_LOCATIONS,
  MARKET_SERVERS,
  formatSilver,
  type MarketLocation,
  type MarketServer,
} from "@/lib/albion/market";

interface Props {
  server: MarketServer;
  location: MarketLocation;
  onServerChange: (value: MarketServer) => void;
  onLocationChange: (value: MarketLocation) => void;
  buyTotal: number;
  sellTotal: number;
  gearTotal: number;
  updatedAt: string | null;
  loading: boolean;
  error: boolean;
  onRefresh: () => void;
}


export function MarketPanel({
  server,
  location,
  onServerChange,
  onLocationChange,
  buyTotal,
  sellTotal,
  gearTotal,

  updatedAt,
  loading,
  error,
  onRefresh,
}: Props) {
  return (
    <section className="panel p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <label className="space-y-1 text-xs text-muted-foreground">
          Servidor
          <Select value={server} onValueChange={(value) => onServerChange(value as MarketServer)}>
            <SelectTrigger aria-label="Servidor do mercado"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MARKET_SERVERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Mercado
          <Select value={location} onValueChange={(value) => onLocationChange(value as MarketLocation)}>
            <SelectTrigger aria-label="Cidade do mercado"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MARKET_LOCATIONS.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>

        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading} aria-label="Atualizar preços">
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Craftar (recursos + artefatos)</p>
          <p className="num mt-1 font-semibold text-primary">{formatSilver(buyTotal)}</p>
        </div>
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShoppingCart className="size-3" /> Comprar equipamentos prontos
          </p>
          <p className="num mt-1 font-semibold">{formatSilver(gearTotal)}</p>
        </div>
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Diferença</p>
          {gearTotal > 0 && buyTotal > 0 ? (
            <p
              className={`num mt-1 font-semibold ${buyTotal < gearTotal ? "text-primary" : "text-destructive"}`}
            >
              {buyTotal < gearTotal ? "Craftar economiza " : "Comprar economiza "}
              {formatSilver(Math.abs(gearTotal - buyTotal))}
              <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                ({Math.round((Math.abs(gearTotal - buyTotal) / Math.max(gearTotal, buyTotal)) * 100)}%)
              </span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Sem cotações suficientes para comparar.</p>
          )}
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock3 className="size-3" />
        {error
          ? "Cotações indisponíveis. A calculadora continua funcionando normalmente."
          : loading
            ? "Atualizando cotações…"
            : updatedAt
              ? `Cotação mais recente: ${new Date(`${updatedAt}Z`).toLocaleString("pt-BR")}`
              : "Sem cotações para os itens selecionados."}
      </p>
    </section>
  );
}