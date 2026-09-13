// Camada de cálculo — independente da interface.
// Recebe as linhas do regear, percorre as receitas de cada Item ID,
// multiplica pela quantidade, soma materiais iguais e separa
// recursos normais de artefatos.

import type { AlbionDataset, EquipmentItem, Regear, ResourceInfo } from "./types";

export interface RequirementRow {
  id: string;
  name: string;
  tier: number;
  enchant: number;
  group: string;
  quantity: number;
}

export interface RequirementGroup {
  group: string;
  total: number;
  rows: RequirementRow[];
}

export interface CraftingResult {
  /** Recursos normais agrupados por tipo (Cloth, Planks, Metal Bar...) */
  resourceGroups: RequirementGroup[];
  /** Artefatos, sempre separados dos recursos */
  artifacts: RequirementRow[];
  /** Item IDs presentes no regear que não existem na base de dados atual */
  unknownItemIds: string[];
  totalItems: number;
}

const EMPTY: CraftingResult = {
  resourceGroups: [],
  artifacts: [],
  unknownItemIds: [],
  totalItems: 0,
};

export function buildItemIndex(items: EquipmentItem[]): Map<string, EquipmentItem> {
  return new Map(items.map((item) => [item.id, item]));
}

function toRow(
  id: string,
  quantity: number,
  resources: Record<string, ResourceInfo>,
): RequirementRow {
  const info = resources[id];
  return {
    id,
    name: info?.name ?? id,
    tier: info?.tier ?? 0,
    enchant: info?.enchant ?? 0,
    group: info?.group ?? "Outros",
    quantity,
  };
}

const sortRows = (a: RequirementRow, b: RequirementRow) =>
  a.tier - b.tier || a.enchant - b.enchant || a.name.localeCompare(b.name);

export function calculateCraftingRequirements(
  lines: Regear["lines"],
  dataset: AlbionDataset | null,
  index?: Map<string, EquipmentItem>,
): CraftingResult {
  if (!dataset || lines.length === 0) return EMPTY;
  const itemIndex = index ?? buildItemIndex(dataset.items);

  const resourceTotals = new Map<string, number>();
  const artifactTotals = new Map<string, number>();
  const unknownItemIds: string[] = [];
  let totalItems = 0;

  for (const line of lines) {
    const item = itemIndex.get(line.itemId);
    if (!item) {
      unknownItemIds.push(line.itemId);
      continue;
    }
    const qty = Math.max(0, Math.floor(line.quantity) || 0);
    if (qty === 0) continue;
    totalItems += qty;

    for (const [resourceId, count] of item.resources) {
      resourceTotals.set(resourceId, (resourceTotals.get(resourceId) ?? 0) + count * qty);
    }
    for (const [artifactId, count] of item.artifacts) {
      artifactTotals.set(artifactId, (artifactTotals.get(artifactId) ?? 0) + count * qty);
    }
  }

  const grouped = new Map<string, RequirementRow[]>();
  for (const [id, quantity] of resourceTotals) {
    const row = toRow(id, quantity, dataset.resources);
    const bucket = grouped.get(row.group);
    if (bucket) bucket.push(row);
    else grouped.set(row.group, [row]);
  }

  const resourceGroups: RequirementGroup[] = [...grouped.entries()]
    .map(([group, rows]) => ({
      group,
      rows: rows.sort(sortRows),
      total: rows.reduce((sum, row) => sum + row.quantity, 0),
    }))
    .sort((a, b) => a.group.localeCompare(b.group));

  const artifacts = [...artifactTotals]
    .map(([id, quantity]) => toRow(id, quantity, dataset.resources))
    .sort(sortRows);

  return { resourceGroups, artifacts, unknownItemIds, totalItems };
}
