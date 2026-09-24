import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SLOT_LABELS, familyLabel, itemIconUrl, itemTierLabel } from "@/lib/albion/format";
import { SLOT_FILTER, type GearSlot } from "@/lib/albion/parties";
import type { AlbionDataset } from "@/lib/albion/types";
import { cn } from "@/lib/utils";

interface Props {
  slot: GearSlot | null;
  dataset: AlbionDataset | null;
  onClose: () => void;
  onSelect: (itemId: string) => void;
}

const TIERS = [4, 5, 6, 7, 8];

export function SlotItemPicker({ slot, dataset, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<number | null>(null);
  const [enchant, setEnchant] = useState<number | null>(null);

  const results = useMemo(() => {
    if (!slot || !dataset) return [];
    const filter = SLOT_FILTER[slot];
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return dataset.items.filter((item) => {
      if (!filter(item)) return false;
      if (tier !== null && item.tier !== tier) return false;
      if (enchant !== null && item.enchant !== enchant) return false;
      const hay = `${item.name} ${item.id} ${itemTierLabel(item)} ${item.family} ${item.category}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [slot, dataset, query, tier, enchant]);

  const chip = (active: boolean) =>
    cn(
      "num rounded-md border px-2 py-1 text-xs transition-colors",
      active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
    );

  return (
    <Dialog open={!!slot} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar {slot ? (SLOT_LABELS[slot] ?? slot) : ""}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por nome, Item ID, tier ou tipo…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={chip(tier === null)} onClick={() => setTier(null)}>
            Todos tiers
          </button>
          {TIERS.map((t) => (
            <button key={t} type="button" className={chip(tier === t)} onClick={() => setTier(t)}>
              T{t}
            </button>
          ))}
          <span className="mx-1 w-px bg-border" />
          <button type="button" className={chip(enchant === null)} onClick={() => setEnchant(null)}>
            Todos
          </button>
          {[0, 1, 2, 3].map((e) => (
            <button key={e} type="button" className={chip(enchant === e)} onClick={() => setEnchant(e)}>
              .{e}
            </button>
          ))}
        </div>
        <ul className="max-h-[55vh] divide-y divide-border overflow-y-auto rounded-md border border-border">
          {results.slice(0, 150).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
              >
                <img src={itemIconUrl(item.id)} alt="" loading="lazy" className="size-10 shrink-0 rounded bg-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.name}</span>
                  <span className="block truncate font-mono text-[11px] text-muted-foreground">{item.id}</span>
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">{familyLabel(item.family)}</span>
                <Badge variant="outline" className="num shrink-0">
                  {itemTierLabel(item)}
                </Badge>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              {dataset ? "Nenhum item encontrado." : "Carregando itens…"}
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
