// Fonte de dados dos equipamentos.
//
// Estratégia:
//   1. Lê o cache local (IndexedDB) e o devolve imediatamente.
//   2. Busca o JSON gerado a partir dos dumps oficiais do Albion
//      (ver scripts/build-albion-data.mjs) e atualiza o cache.
//   3. Se a busca falhar (offline / fonte indisponível), continua com o cache.
//
// Para trocar de fonte no futuro, basta alterar DATASET_URL / fetchRemoteDataset
// mantendo o formato descrito em src/lib/albion/types.ts.

import { STORE_META, idbGet, idbPut } from "./idb";
import type { AlbionDataset } from "./types";

export const DATASET_URL = "/data/albion-items.v1.json";
const CACHE_KEY = "dataset:v1";

export interface DatasetState {
  dataset: AlbionDataset;
  fromCache: boolean;
}

async function readCache(): Promise<AlbionDataset | null> {
  try {
    return (await idbGet<AlbionDataset>(STORE_META, CACHE_KEY)) ?? null;
  } catch {
    return null;
  }
}

async function writeCache(dataset: AlbionDataset) {
  try {
    await idbPut(STORE_META, dataset, CACHE_KEY);
  } catch {
    /* cache é opcional */
  }
}

async function fetchRemoteDataset(): Promise<AlbionDataset> {
  const res = await fetch(DATASET_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Falha ao baixar os dados (HTTP ${res.status})`);
  const data = (await res.json()) as AlbionDataset;
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("Base de dados inválida");
  }
  return data;
}

/** Carrega o dataset: cache primeiro, revalidando em seguida. */
export async function loadDataset(
  onCache?: (dataset: AlbionDataset) => void,
): Promise<DatasetState> {
  const cached = await readCache();
  if (cached) onCache?.(cached);

  try {
    const fresh = await fetchRemoteDataset();
    if (!cached || fresh.generatedAt !== cached.generatedAt) await writeCache(fresh);
    return { dataset: fresh, fromCache: false };
  } catch (error) {
    if (cached) return { dataset: cached, fromCache: true };
    throw error;
  }
}
