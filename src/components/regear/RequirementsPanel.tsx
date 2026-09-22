import { Gem, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatNumber, itemIconUrl } from "@/lib/albion/format";
import type { CraftingResult } from "@/lib/albion/crafting";
import { formatSilver, type MarketPrice } from "@/lib/albion/market";

interface Props {
  result: CraftingResult;
  prices: Map<string, MarketPrice>;
}

export function RequirementsPanel({ result, prices }: Props) {
  const hasResources = result.resourceGroups.length > 0;

  return (
    <div
      className={
        result.artifacts.length > 0 ? "grid gap-4 xl:grid-cols-[1.6fr_1fr]" : "grid gap-4"
      }
    >
      <section className="panel p-4">
        <header className="mb-3 flex items-center gap-2">
          <Package className="size-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Recursos necessários
          </h2>
        </header>

        {!hasResources && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Adicione equipamentos para ver o total de materiais.
          </p>
        )}

        <div className="space-y-4">
          {result.resourceGroups.map((group) => (
            <div key={group.group}>
              <div className="mb-1 flex items-baseline justify-between border-b border-border pb-1">
                <h3 className="text-sm font-semibold text-foreground">{group.group}</h3>
                <div className="num flex gap-3 text-xs text-muted-foreground">
                  <span>{formatNumber(group.total)} un.</span>
                  <span className="text-primary">
                    Venda {formatSilver(group.rows.reduce((sum, row) => sum + (prices.get(row.id)?.sellPriceMin ?? 0) * row.quantity, 0))}
                  </span>
                  <span>Compra {formatSilver(group.rows.reduce((sum, row) => sum + (prices.get(row.id)?.buyPriceMax ?? 0) * row.quantity, 0))}</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5 pr-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={itemIconUrl(row.id)}
                            alt=""
                            loading="lazy"
                            className="size-7 rounded bg-muted"
                          />
                          <span className="truncate">{row.name}</span>
                        </div>
                      </td>
                      <td className="w-16 py-1.5">
                        <Badge variant="outline" className="num">
                          T{row.tier}
                          {row.enchant > 0 ? `.${row.enchant}` : ""}
                        </Badge>
                      </td>
                      <td className="num w-28 py-1.5 text-right font-semibold text-primary">
                        {formatNumber(row.quantity)}
                      </td>
                      <td className="num w-36 py-1.5 text-right text-xs">
                        <span className="text-primary">{formatSilver(prices.get(row.id)?.sellPriceMin)}</span>
                        <span className="block text-muted-foreground">{formatSilver(prices.get(row.id)?.buyPriceMax)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {result.artifacts.length > 0 && (
        <section className="panel h-fit p-4">
          <header className="mb-3 flex items-center gap-2">
            <Gem className="size-4 text-artifact" />
            <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              Artefatos necessários
            </h2>
          </header>

          <table className="w-full text-sm">
            <tbody>
              {result.artifacts.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  <td className="py-1.5 pr-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={itemIconUrl(row.id)}
                        alt=""
                        loading="lazy"
                        className="size-7 rounded bg-muted"
                      />
                      <span className="truncate">{row.name}</span>
                    </div>
                  </td>
                  <td className="w-14 py-1.5">
                    <Badge variant="outline" className="num">
                      T{row.tier}
                      {row.enchant > 0 ? `.${row.enchant}` : ""}
                    </Badge>
                  </td>
                  <td className="num w-20 py-1.5 text-right font-semibold">
                    {formatNumber(row.quantity)}
                  </td>
                  <td className="num w-32 py-1.5 text-right text-xs">
                    <span className="text-primary">{formatSilver(prices.get(row.id)?.sellPriceMin)}</span>
                    <span className="block text-muted-foreground">{formatSilver(prices.get(row.id)?.buyPriceMax)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
