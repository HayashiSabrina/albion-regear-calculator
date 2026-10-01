import { Hammer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNumber, itemIconUrl, itemTierLabel } from "@/lib/albion/format";
import { formatSilver, type MarketPrice } from "@/lib/albion/market";
import type { SummaryRow } from "@/lib/albion/parties";
import type { EquipmentItem } from "@/lib/albion/types";

interface Props {
  rows: SummaryRow[];
  itemIndex: Map<string, EquipmentItem>;
  prices: Map<string, MarketPrice>;
  loading: boolean;
  onCraft: () => void;
}

export function RegearSummary({ rows, itemIndex, prices, loading, onCraft }: Props) {
  const unit = (id: string) => prices.get(id)?.sellPriceMin ?? null;
  const totalQty = rows.reduce((a, r) => a + r.quantity, 0);
  const totalValue = rows.reduce((a, r) => a + (unit(r.itemId) ?? 0) * r.quantity, 0);
  const craftable = rows.some((r) => (itemIndex.get(r.itemId)?.resources.length ?? 0) > 0);

  const section = (title: string, list: SummaryRow[]) =>
    list.length > 0 && (
      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">{title}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] text-muted-foreground uppercase">
              <tr>
                <th className="py-1 font-medium">Item</th>
                <th className="py-1 text-right font-medium">Qtd.</th>
                <th className="py-1 text-right font-medium">Preço unit.</th>
                <th className="py-1 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((r) => {
                const item = itemIndex.get(r.itemId);
                const u = unit(r.itemId);
                return (
                  <tr key={r.itemId}>
                    <td className="py-1.5">
                      <div className="flex items-center gap-2">
                        <img src={itemIconUrl(r.itemId)} alt="" loading="lazy" className="size-8 shrink-0" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{item?.name ?? r.itemId}</span>
                          <span className="num block text-[11px] text-muted-foreground">
                            {item ? itemTierLabel(item) : r.itemId}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="num py-1.5 text-right">{formatNumber(r.quantity)}</td>
                    <td className="num py-1.5 text-right text-muted-foreground">{loading ? "…" : formatSilver(u)}</td>
                    <td className="num py-1.5 text-right">{loading ? "…" : formatSilver(u == null ? null : u * r.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

  return (
    <section className="panel space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-bold tracking-wide">RESUMO DO REGEAR</h2>
        <Button size="sm" onClick={onCraft} disabled={!craftable}>
          <Hammer /> Craft
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Adicione itens às builds para ver o resumo.</p>
      ) : (
        <>
          {section("Equipamentos", rows.filter((r) => !r.consumable))}
          {section("Consumíveis", rows.filter((r) => r.consumable))}
          <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3 text-sm">
            <span>
              Total de itens: <strong className="num">{formatNumber(totalQty)}</strong>
            </span>
            <span>
              Valor de mercado: <strong className="num text-primary">{formatSilver(totalValue)}</strong>
            </span>
          </div>
        </>
      )}
    </section>
  );
}
