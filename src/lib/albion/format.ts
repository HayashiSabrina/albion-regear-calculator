import type { EquipmentCategory, EquipmentItem } from "./types";

export const tierLabel = (tier: number, enchant: number) =>
  enchant > 0 ? `T${tier}.${enchant}` : `T${tier}`;

export const itemTierLabel = (item: EquipmentItem) => tierLabel(item.tier, item.enchant);

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  weapon: "Armas",
  armor: "Armaduras",
  offhand: "Off-hands",
};

export const SLOT_LABELS: Record<string, string> = {
  mainhand: "Arma",
  head: "Capacete",
  chest: "Peito",
  shoes: "Botas",
  offhand: "Off-hand",
};

const WORD = /(^|[\s_])([a-z])/g;

export const familyLabel = (family: string) =>
  family.replace(/_/g, " ").replace(WORD, (_, sep: string, char: string) => sep + char.toUpperCase());

export const formatNumber = (value: number) => value.toLocaleString("pt-BR");

export const itemIconUrl = (itemId: string) =>
  `https://render.albiononline.com/v1/item/${encodeURIComponent(itemId)}.png?size=64`;

export const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
};
