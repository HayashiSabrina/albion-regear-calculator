import { Minus, Plus, X } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SLOT_LABELS, itemIconUrl, itemTierLabel } from "@/lib/albion/format";
import type { BuildItem, GearSlot } from "@/lib/albion/parties";
import type { EquipmentItem } from "@/lib/albion/types";
import { cn } from "@/lib/utils";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

interface Props {
  slot: GearSlot;
  entry?: BuildItem | undefined;
  item?: EquipmentItem | undefined;
  blocked?: boolean | undefined;
  onPick: () => void;
  onClear: () => void;
  onQuantity: (value: number) => void;
  onDropItem: (fromSlot: GearSlot) => void;
}

export function GearSlotButton({ slot, entry, item, blocked, onPick, onClear, onQuantity, onDropItem }: Props) {
  const label = SLOT_LABELS[slot] ?? slot;
  const qty = entry?.quantityPerSet ?? 1;

  return (
    <div className="flex flex-col items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled={blocked}
            onClick={onPick}
            draggable={!!entry}
            onDragStart={(e) => e.dataTransfer.setData("text/slot", slot)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const from = e.dataTransfer.getData("text/slot") as GearSlot;
              if (from && from !== slot) onDropItem(from);
            }}
            aria-label={item ? `${label}: ${item.name}` : `Escolher ${label}`}
            className={cn(
              "gear-slot group relative flex size-16 items-center justify-center sm:size-[72px]",
              entry && "gear-slot-filled",
              blocked && "cursor-not-allowed opacity-40",
            )}
          >
            {entry ? (
              <>
                <img
                  src={itemIconUrl(entry.itemId)}
                  alt={item?.name ?? entry.itemId}
                  className="size-full object-contain drop-shadow"
                  loading="lazy"
                />
                {item && (
                  <span className="num absolute top-1 left-1 rounded-sm bg-background/80 px-1 text-[9px] font-bold leading-tight text-primary">
                    {ROMAN[item.tier] ?? item.tier}
                    {item.enchant > 0 && `.${item.enchant}`}
                  </span>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Limpar slot"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="absolute -top-1.5 -right-1.5 hidden rounded-full bg-destructive p-0.5 text-destructive-foreground group-hover:block"
                >
                  <X className="size-3" />
                </span>
              </>
            ) : (
              <X className="size-7 text-muted-foreground/50" strokeWidth={1.25} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-56">
          {item ? (
            <div className="space-y-0.5">
              <p className="font-semibold">{item.name}</p>
              <p className="num text-[11px] opacity-80">
                {itemTierLabel(item)} · {label}
              </p>
              <p className="font-mono text-[10px] opacity-70">{item.id}</p>
            </div>
          ) : blocked ? (
            "Bloqueado por arma de duas mãos"
          ) : (
            `${label} — clique para escolher`
          )}
        </TooltipContent>
      </Tooltip>
      <span className="text-[10px] tracking-wider text-muted-foreground uppercase">{label}</span>
      {entry && (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Diminuir"
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            onClick={() => onQuantity(Math.max(1, qty - 1))}
          >
            <Minus className="size-3" />
          </button>
          <span className="num min-w-6 text-center text-[11px] font-semibold">×{qty}</span>
          <button
            type="button"
            aria-label="Aumentar"
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            onClick={() => onQuantity(qty + 1)}
          >
            <Plus className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}
