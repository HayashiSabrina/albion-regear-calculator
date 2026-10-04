// Party Builds — composições de party persistidas localmente (IndexedDB).
// A "Build" (itens por set) é separada do "Regear" (quantos sets).

import { STORE_PARTIES, idbDelete, idbGet, idbGetAll, idbPut } from "./idb";
import type { EquipmentItem } from "./types";

export type GearSlot =
  | "bag"
  | "head"
  | "cape"
  | "mainhand"
  | "chest"
  | "offhand"
  | "potion"
  | "shoes"
  | "food"
  | "mount";

export const CONSUMABLE_SLOTS: GearSlot[] = ["food", "potion"];

/** Categoria do dataset aceita por cada slot (armaduras filtradas pelo campo slot). */
export const SLOT_FILTER: Record<GearSlot, (item: EquipmentItem) => boolean> = {
  bag: (i) => i.category === "bag",
  head: (i) => i.category === "armor" && i.slot === "head",
  cape: (i) => i.category === "cape",
  mainhand: (i) => i.category === "weapon",
  chest: (i) => i.category === "armor" && i.slot === "chest",
  offhand: (i) => i.category === "offhand",
  potion: (i) => i.category === "potion",
  shoes: (i) => i.category === "armor" && i.slot === "shoes",
  food: (i) => i.category === "food",
  mount: (i) => i.category === "mount",
};

export const ROLES = ["Tank", "Healer", "DPS", "Support", "Shotcaller", "Utility", "Other"];

export interface BuildItem {
  slot: GearSlot;
  itemId: string;
  quantityPerSet: number;
}

export interface PartyMember {
  id: string;
  name: string;
  role: string;
  regearSets: number;
  items: BuildItem[];
}

export interface Party {
  id: string;
  name: string;
  description: string;
  members: PartyMember[];
  createdAt: string;
  updatedAt: string;
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const isTwoHanded = (itemId: string | undefined) => !!itemId && itemId.includes("_2H_");

export async function listParties(): Promise<Party[]> {
  const all = await idbGetAll<Party>(STORE_PARTIES);
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Busca direta usada pela página de exportação, sem depender da ordenação da lista. */
export const getParty = (id: string) => idbGet<Party>(STORE_PARTIES, id);


export async function saveParty(party: Party): Promise<Party> {
  const next = { ...party, updatedAt: new Date().toISOString() };
  await idbPut(STORE_PARTIES, next);
  return next;
}

export const deleteParty = (id: string) => idbDelete(STORE_PARTIES, id);

export function newMember(index: number): PartyMember {
  return { id: newId(), name: `Player ${index}`, role: "DPS", regearSets: 1, items: [] };
}

export async function createParty(name: string): Promise<Party> {
  const now = new Date().toISOString();
  const party: Party = {
    id: newId(),
    name: name.trim() || "Nova Composição",
    description: "",
    members: [newMember(1)],
    createdAt: now,
    updatedAt: now,
  };
  await idbPut(STORE_PARTIES, party);
  return party;
}

/** "Tank 1" -> "Tank 2"; senão acrescenta " 2". */
export function nextName(name: string, taken: string[]) {
  const match = /^(.*?)(\d+)$/.exec(name.trim());
  const base = match ? match[1] : `${name.trim()} `;
  let n = match ? Number(match[2]) + 1 : 2;
  while (taken.includes(`${base}${n}`)) n += 1;
  return `${base}${n}`;
}

export const cloneMember = (member: PartyMember, taken: string[]): PartyMember => ({
  ...member,
  id: newId(),
  name: nextName(member.name, taken),
  items: member.items.map((item) => ({ ...item })),
});

export async function duplicateParty(source: Party, name?: string): Promise<Party> {
  const now = new Date().toISOString();
  const copy: Party = {
    ...source,
    id: newId(),
    name: name?.trim() || `${source.name} (cópia)`,
    members: source.members.map((m) => ({ ...m, id: newId(), items: m.items.map((i) => ({ ...i })) })),
    createdAt: now,
    updatedAt: now,
  };
  await idbPut(STORE_PARTIES, copy);
  return copy;
}

export function setMemberItem(member: PartyMember, slot: GearSlot, itemId: string | null): PartyMember {
  let items = member.items.filter((item) => item.slot !== slot);
  if (itemId) {
    const previous = member.items.find((item) => item.slot === slot);
    const defaultQty = slot === "food" ? 3 : slot === "potion" ? 2 : 1;
    items.push({ slot, itemId, quantityPerSet: previous?.quantityPerSet ?? defaultQty });
    if (slot === "mainhand" && isTwoHanded(itemId)) items = items.filter((i) => i.slot !== "offhand");
  }
  return { ...member, items };
}

export interface SummaryRow {
  itemId: string;
  quantity: number;
  consumable: boolean;
}

/** Soma por Item ID: quantidade por set × regear sets de cada player. */
export function consolidatePartyItems(party: Party | null): SummaryRow[] {
  const map = new Map<string, SummaryRow>();
  for (const member of party?.members ?? []) {
    const sets = Math.max(0, member.regearSets);
    for (const item of member.items) {
      const qty = item.quantityPerSet * sets;
      if (qty <= 0) continue;
      const row = map.get(item.itemId);
      if (row) row.quantity += qty;
      else
        map.set(item.itemId, {
          itemId: item.itemId,
          quantity: qty,
          consumable: CONSUMABLE_SLOTS.includes(item.slot),
        });
    }
  }
  return [...map.values()];
}
