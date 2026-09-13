import { Plus, Star, Swords } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/albion/format";
import type { Regear } from "@/lib/albion/types";

interface Props {
  regears: Regear[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onToggleFavorite: (regear: Regear) => void;
}

export function RegearSidebar({
  regears,
  activeId,
  onSelect,
  onCreate,
  onToggleFavorite,
}: Props) {
  const [name, setName] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const visible = onlyFavorites ? regears.filter((regear) => regear.favorite) : regears;

  const submit = () => {
    onCreate(name);
    setName("");
  };

  return (
    <aside className="panel flex h-fit flex-col gap-4 p-4 lg:sticky lg:top-4">
      <div className="flex items-center gap-2">
        <Swords className="size-5 text-primary" />
        <div>
          <p className="font-display text-sm font-bold tracking-wide">REGEAR FORGE</p>
          <p className="text-[11px] text-muted-foreground">Albion Online</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Criar regear
        </p>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
            placeholder="Ex.: ZvZ Holy Healer"
          />
          <Button size="icon" onClick={submit} aria-label="Criar regear">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            Meus regears ({regears.length})
          </p>
          <button
            type="button"
            onClick={() => setOnlyFavorites((value) => !value)}
            className={cn(
              "text-[11px] transition-colors hover:text-primary",
              onlyFavorites ? "text-primary" : "text-muted-foreground",
            )}
          >
            {onlyFavorites ? "Todos" : "Favoritos"}
          </button>
        </div>

        <ul className="space-y-1">
          {visible.map((regear) => (
            <li key={regear.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect(regear.id)}
                className={cn(
                  "min-w-0 flex-1 rounded-md px-2 py-2 text-left transition-colors",
                  regear.id === activeId
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50",
                )}
              >
                <span className="block truncate text-sm font-medium">{regear.name}</span>
                <span className="num block text-[11px] text-muted-foreground">
                  {regear.lines.length} itens · {formatDate(regear.updatedAt)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggleFavorite(regear)}
                aria-label="Favoritar"
                className="rounded p-1 text-muted-foreground transition-colors hover:text-primary"
              >
                <Star
                  className={cn("size-4", regear.favorite && "fill-primary text-primary")}
                />
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="px-2 py-6 text-xs text-muted-foreground">
              {onlyFavorites
                ? "Nenhum favorito ainda."
                : "Crie seu primeiro regear para começar."}
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}
