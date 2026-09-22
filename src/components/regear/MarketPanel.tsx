import { Clock3, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";

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
  updatedAt,
  loading,
  error,
  onRefresh,
}: Props) {
  return (
    <section className="panel p-4">
      <div className="grid gap-3 lg:grid-cols-[180px_200px_minmax(0,1fr)_auto] lg:items-end">
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
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><TrendingDown className="size-3 text-primary" /> Menor venda</p>
            <p className="num mt-1 font-semibold text-primary">{formatSilver(buyTotal)}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><TrendingUp className="size-3" /> Maior compra</p>
            <p className="num mt-1 font-semibold">{formatSilver(sellTotal)}</p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading} aria-label="Atualizar preços">
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </Button>
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