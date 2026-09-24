import { Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GearSlotButton } from "@/components/party/GearSlotButton";
import {
  ROLES,
  isTwoHanded,
  setMemberItem,
  type GearSlot,
  type PartyMember,
} from "@/lib/albion/parties";
import type { EquipmentItem } from "@/lib/albion/types";

// Disposição inspirada na tela de equipamento do Albion.
const GRID: (GearSlot | null)[] = [
  "bag", "head", "cape",
  "mainhand", "chest", "offhand",
  "potion", "shoes", "food",
  null, "mount", null,
];

interface Props {
  member: PartyMember;
  itemIndex: Map<string, EquipmentItem>;
  onChange: (member: PartyMember) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onPickSlot: (slot: GearSlot) => void;
}

export function MemberCard({ member, itemIndex, onChange, onDuplicate, onRemove, onPickSlot }: Props) {
  const bySlot = new Map(member.items.map((i) => [i.slot, i]));
  const twoHanded = isTwoHanded(bySlot.get("mainhand")?.itemId);
  const customRole = !ROLES.includes(member.role);

  const setQty = (slot: GearSlot, value: number) =>
    onChange({
      ...member,
      items: member.items.map((i) => (i.slot === slot ? { ...i, quantityPerSet: value } : i)),
    });

  const move = (from: GearSlot, to: GearSlot) => {
    const source = bySlot.get(from);
    if (!source) return;
    const item = itemIndex.get(source.itemId);
    // Só troca se o slot de destino aceitar o mesmo tipo (ex.: comida ↔ comida não se aplica; só mesmo slot)
    if (!item || item.slot !== to) return;
    onChange(setMemberItem(setMemberItem(member, from, null), to, source.itemId));
  };

  return (
    <article className="panel flex flex-col gap-3 p-4">
      <div className="flex items-start gap-2">
        <Input
          value={member.name}
          aria-label="Nome do player"
          onChange={(e) => onChange({ ...member, name: e.target.value })}
          className="h-8 font-semibold"
        />
        <Button size="icon" variant="ghost" className="size-8 shrink-0" onClick={onDuplicate} aria-label="Duplicar build">
          <Copy className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" className="size-8 shrink-0 text-destructive" onClick={onRemove} aria-label="Remover player">
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-wider text-muted-foreground uppercase">Função</span>
          <div className="flex gap-1">
            <select
              value={customRole ? "__custom" : member.role}
              onChange={(e) => onChange({ ...member, role: e.target.value === "__custom" ? "" : e.target.value })}
              className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
              aria-label="Função"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="__custom">Personalizada…</option>
            </select>
            {customRole && (
              <Input
                value={member.role}
                placeholder="Função"
                onChange={(e) => onChange({ ...member, role: e.target.value })}
                className="h-8 w-28"
              />
            )}
          </div>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] tracking-wider text-muted-foreground uppercase">Regear sets</span>
          <Input
            type="number"
            min={0}
            value={member.regearSets}
            onChange={(e) => onChange({ ...member, regearSets: Math.max(0, Math.floor(Number(e.target.value)) || 0) })}
            className="num h-8 w-20"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-3 rounded-lg bg-muted/30 py-4">
        {GRID.map((slot, idx) =>
          slot ? (
            <GearSlotButton
              key={slot}
              slot={slot}
              entry={bySlot.get(slot)}
              item={bySlot.get(slot) ? itemIndex.get(bySlot.get(slot)!.itemId) : undefined}
              blocked={slot === "offhand" && twoHanded}
              onPick={() => onPickSlot(slot)}
              onClear={() => onChange(setMemberItem(member, slot, null))}
              onQuantity={(v) => setQty(slot, v)}
              onDropItem={(from) => move(from, slot)}
            />
          ) : (
            <span key={`empty-${idx}`} />
          ),
        )}
      </div>
    </article>
  );
}
