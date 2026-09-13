// Tipos da camada de dados do Albion. Ver scripts/build-albion-data.mjs
// para a origem e o formato exato do JSON consumido.

export type ResourceEntry = [resourceId: string, count: number];

export type EquipmentCategory = "weapon" | "armor" | "offhand";

export interface EquipmentItem {
  /** Item ID oficial do Albion (ex.: T8_2H_HOLYSTAFF_HELL@1). Identificador principal. */
  id: string;
  name: string;
  tier: number;
  /** 0 = sem encantamento, 1..3 = .1 .2 .3 */
  enchant: number;
  category: EquipmentCategory;
  /** Família: swords, holystaff, cloth, plate, offhand... */
  family: string;
  /** mainhand | head | chest | shoes | offhand */
  slot: string;
  resources: ResourceEntry[];
  artifacts: ResourceEntry[];
}

export interface ResourceInfo {
  name: string;
  tier: number;
  enchant: number;
  /** Grupo de exibição: Cloth, Planks, Metal Bar, Tokens, Artefatos... */
  group: string;
}

export interface AlbionDataset {
  version: number;
  generatedAt: string;
  source: string;
  items: EquipmentItem[];
  resources: Record<string, ResourceInfo>;
}

export interface RegearLine {
  itemId: string;
  quantity: number;
}

export interface Regear {
  id: string;
  name: string;
  favorite: boolean;
  lines: RegearLine[];
  createdAt: string;
  updatedAt: string;
}
