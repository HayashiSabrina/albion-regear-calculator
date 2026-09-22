import { PackageOpen, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { itemIconUrl, itemTierLabel } from "@/lib/albion/format";
import { formatSilver, isStaleMarketDate, type MarketPrice } from "@/lib/albion/market";
import type { EquipmentItem, RegearLine } from "@/lib/albion/types";

interface Props {
  lines: RegearLine[];
  itemIndex: Map<string, EquipmentItem>;
  prices: Map<string, MarketPrice>;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function RegearTable({ lines, itemIndex, prices, onQuantityChange, onRemove }: Props) {
  return (
    <section className="panel overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <PackageOpen className="size-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Equipamentos do regear
          </h2>
        </div>
        <span className="num text-xs text-muted-foreground">{lines.length} linhas</span>
      </header>

      {lines.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <PackageOpen className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium">Nenhum equipamento adicionado</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use a busca abaixo para montar este regear.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/40 text-left text-[11px] tracking-widest text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2 font-semibold">Equipamento</th>
                <th className="w-28 px-3 py-2 font-semibold">Tier</th>
                <th className="w-28 px-3 py-2 font-semibold">Quantidade</th>
                <th className="w-36 px-3 py-2 text-right font-semibold">Menor venda</th>
                <th className="w-36 px-3 py-2 text-right font-semibold">Maior compra</th>
                <th className="w-16 px-4 py-2 text-right font-semibold">Remover</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const item = itemIndex.get(line.itemId);
                const price = prices.get(line.itemId);
                return (
                  <tr key={line.itemId} className="border-t border-border/60">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={itemIconUrl(line.itemId)}
                          alt=""
                          loading="lazy"
                          className="size-11 shrink-0 rounded-md bg-muted object-contain"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item?.name ?? "Item não encontrado"}</p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {line.itemId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="num">
                        {item ? itemTierLabel(item) : "—"}
                      </Badge>
                    </td>
                    <td className="num px-3 py-2.5 text-right">
                      <p className="font-semibold text-primary">{formatSilver(price?.sellPriceMin)}</p>
                      {price?.sellPriceMin && (
                        <p className="text-[10px] text-muted-foreground">
                          Total {formatSilver(price.sellPriceMin * line.quantity)}
                          {isStaleMarketDate(price.sellPriceMinDate) ? " · antiga" : ""}
                        </p>
                      )}
                    </td>
                    <td className="num px-3 py-2.5 text-right">
                      <p className="font-semibold">{formatSilver(price?.buyPriceMax)}</p>
                      {price?.buyPriceMax && (
                        <p className="text-[10px] text-muted-foreground">
                          Total {formatSilver(price.buyPriceMax * line.quantity)}
                          {isStaleMarketDate(price.buyPriceMaxDate) ? " · antiga" : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        aria-label={`Quantidade de ${item?.name ?? line.itemId}`}
                        onChange={(event) =>
                          onQuantityChange(line.itemId, Math.max(1, Number(event.target.value) || 1))
                        }
                        className="num w-20"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover ${item?.name ?? line.itemId}`}
                        onClick={() => onRemove(line.itemId)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}