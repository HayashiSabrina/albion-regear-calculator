import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_LABELS,
  SLOT_LABELS,
  familyLabel,
  itemIconUrl,
  itemTierLabel,
} from "@/lib/albion/format";
import type { AlbionDataset, EquipmentCategory, EquipmentItem } from "@/lib/albion/types";

const MAX_RESULTS = 120;
const ALL = "all";

interface Props {
  dataset: AlbionDataset | null;
  onAdd: (itemId: string, quantity: number) => void;
}

export function ItemPicker({ dataset, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [family, setFamily] = useState<string>(ALL);
  const [tier, setTier] = useState<string>(ALL);
  const [enchant, setEnchant] = useState<string>(ALL);
  const [quantity, setQuantity] = useState(1);

  const items = dataset?.items ?? [];

  const families = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (category !== ALL && item.category !== category) continue;
      set.add(item.family);
    }
    return [...set].sort((a, b) => familyLabel(a).localeCompare(familyLabel(b)));
  }, [items, category]);

  const tiers = useMemo(() => [...new Set(items.map((item) => item.tier))].sort(), [items]);

  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches: EquipmentItem[] = [];
    for (const item of items) {
      if (category !== ALL && item.category !== category) continue;
      if (family !== ALL && item.family !== family) continue;
      if (tier !== ALL && item.tier !== Number(tier)) continue;
      if (enchant !== ALL && item.enchant !== Number(enchant)) continue;
      if (terms.length) {
        const haystack = `${item.name} ${item.id} ${itemTierLabel(item)} ${item.family} ${item.category}`.toLowerCase();
        if (!terms.every((term) => haystack.includes(term))) continue;
      }
      matches.push(item);
      if (matches.length > MAX_RESULTS * 4) break;
    }
    return matches;
  }, [items, query, category, family, tier, enchant]);

  return (
    <section className="panel p-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
          Adicionar equipamento
        </h2>
        <span className="num text-xs text-muted-foreground">
          {results.length > MAX_RESULTS
            ? `${MAX_RESULTS}+ resultados`
            : `${results.length} resultados`}
        </span>
      </header>

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, Item ID, tier ou categoria (ex.: Kingmaker, T8_2H_...)"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Qtd</span>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="num w-20"
          />
        </div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            setFamily(ALL);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as categorias</SelectItem>
            {(Object.keys(CATEGORY_LABELS) as EquipmentCategory[]).map((key) => (
              <SelectItem key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={family} onValueChange={setFamily}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={ALL}>Todos os tipos</SelectItem>
            {families.map((value) => (
              <SelectItem key={value} value={value}>
                {familyLabel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger>
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os tiers</SelectItem>
            {tiers.map((value) => (
              <SelectItem key={value} value={String(value)}>
                T{value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={enchant} onValueChange={setEnchant}>
          <SelectTrigger>
            <SelectValue placeholder="Encantamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os encantamentos</SelectItem>
            <SelectItem value="0">Sem encantamento</SelectItem>
            <SelectItem value="1">.1</SelectItem>
            <SelectItem value="2">.2</SelectItem>
            <SelectItem value="3">.3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul className="mt-3 max-h-[22rem] divide-y divide-border overflow-y-auto rounded-md border border-border">
        {results.slice(0, MAX_RESULTS).map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onAdd(item.id, quantity)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
            >
              <img
                src={itemIconUrl(item.id)}
                alt=""
                loading="lazy"
                className="size-9 shrink-0 rounded bg-muted"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.name}</span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                  {item.id}
                </span>
              </span>
              <Badge variant="outline" className="num shrink-0">
                {itemTierLabel(item)}
              </Badge>
              <span className="hidden w-24 shrink-0 truncate text-xs text-muted-foreground sm:block">
                {SLOT_LABELS[item.slot] ?? item.slot}
              </span>
              <Plus className="size-4 shrink-0 text-primary" />
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-muted-foreground">
            Nenhum equipamento encontrado com esses filtros.
          </li>
        )}
      </ul>
      {results.length > MAX_RESULTS && (
        <p className="mt-2 text-xs text-muted-foreground">
          Mostrando os primeiros {MAX_RESULTS} — refine a busca ou use os filtros.
        </p>
      )}
    </section>
  );
}
