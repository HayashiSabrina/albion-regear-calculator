// Persistência dos regears do usuário — 100% local (IndexedDB), sem backend.

import { STORE_REGEARS, idbDelete, idbGetAll, idbPut } from "./idb";
import type { Regear, RegearLine } from "./types";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `rg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const touch = (regear: Regear): Regear => ({ ...regear, updatedAt: new Date().toISOString() });

export async function listRegears(): Promise<Regear[]> {
  const all = await idbGetAll<Regear>(STORE_REGEARS);
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveRegear(regear: Regear): Promise<Regear> {
  const next = touch(regear);
  await idbPut(STORE_REGEARS, next);
  return next;
}

export async function createRegear(name: string): Promise<Regear> {
  const now = new Date().toISOString();
  const regear: Regear = {
    id: newId(),
    name: name.trim() || "Novo Regear",
    favorite: false,
    lines: [],
    createdAt: now,
    updatedAt: now,
  };
  await idbPut(STORE_REGEARS, regear);
  return regear;
}

export async function duplicateRegear(source: Regear): Promise<Regear> {
  const now = new Date().toISOString();
  const copy: Regear = {
    ...source,
    id: newId(),
    name: `${source.name} 2`,
    lines: source.lines.map((line) => ({ ...line })),
    createdAt: now,
    updatedAt: now,
  };
  await idbPut(STORE_REGEARS, copy);
  return copy;
}

export async function deleteRegear(id: string): Promise<void> {
  await idbDelete(STORE_REGEARS, id);
}

/** Soma a quantidade quando o Item ID já existe na lista. */
export function addLine(lines: RegearLine[], itemId: string, quantity: number): RegearLine[] {
  const qty = Math.max(1, Math.floor(quantity) || 1);
  const existing = lines.find((line) => line.itemId === itemId);
  if (existing) {
    return lines.map((line) =>
      line.itemId === itemId ? { ...line, quantity: line.quantity + qty } : line,
    );
  }
  return [...lines, { itemId, quantity: qty }];
}

export const setLineQuantity = (lines: RegearLine[], itemId: string, quantity: number) =>
  lines.map((line) =>
    line.itemId === itemId ? { ...line, quantity: Math.max(1, Math.floor(quantity) || 1) } : line,
  );

export const removeLine = (lines: RegearLine[], itemId: string) =>
  lines.filter((line) => line.itemId !== itemId);
