// =============================================================================
// Gerador da base de dados de equipamentos do Albion Online
// =============================================================================
//
// DE ONDE VÊM OS DADOS
//   Repositório público oficialmente usado pela comunidade (dumps do client):
//   https://github.com/ao-data/ao-bin-dumps
//
// ENDPOINTS UTILIZADOS
//   1. https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.json
//      -> dump completo do items.xml do client (tiers, categorias,
//         craftingrequirements e enchantments de cada item).
//   2. https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json
//      -> nomes localizados (usamos EN-US) por UniqueName.
//
// FORMATO GERADO (public/data/albion-items.v1.json)
//   {
//     "version": 1,
//     "generatedAt": "ISO date",
//     "source": "...",
//     "items":     [{ id, name, tier, enchant, category, family, slot,
//                     resources: [[resourceId, count]],
//                     artifacts: [[artifactId, count]] }],
//     "resources": { "<id>": { name, tier, enchant, group } }
//   }
//
// COMO ATUALIZAR
//   bun run data:build     (ou: node scripts/build-albion-data.mjs)
//   O app baixa esse JSON, guarda em IndexedDB e usa o cache offline.
//
// PARA TROCAR DE FONTE NO FUTURO
//   Basta gerar um JSON com o mesmo formato acima; a interface não muda.
// =============================================================================

import { writeFile, mkdir } from "node:fs/promises";

const BASE = "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master";
const OUT = "public/data/albion-items.v1.json";

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Slots que interessam. Capas, bolsas, montarias, comidas, poções,
// ferramentas de coleta, vanity e decoração ficam de fora.
const ARMOR_SLOTS = { head: "head", armor: "chest", shoes: "shoes" };
const ALLOWED_SHOP_CATEGORIES = new Set(["weapons", "head", "armors", "shoes", "offhands"]);

const REFINED_GROUPS = {
  CLOTH: "Cloth",
  LEATHER: "Leather",
  METALBAR: "Metal Bar",
  PLANKS: "Planks",
  STONEBLOCK: "Stone Block",
  ORE: "Ore",
  WOOD: "Wood",
  FIBER: "Fiber",
  HIDE: "Hide",
  ROCK: "Rock",
};

function parseResourceId(id) {
  const m = /^T(\d)_([A-Z0-9_]+?)(?:_LEVEL([1-3]))?$/.exec(id);
  const tier = m ? Number(m[1]) : 0;
  const enchant = m ? Number(m[3] ?? 0) : 0;
  const base = m ? m[2] : id;
  let group = REFINED_GROUPS[base];
  if (!group) {
    if (base.includes("TOKEN")) group = "Tokens";
    else group = "Componentes";
  }
  return { tier, enchant, base, group };
}

function firstRecipe(node) {
  const reqs = asArray(node.craftingrequirements);
  return reqs[0] ?? null;
}

function splitResources(recipe) {
  const resources = [];
  const artifacts = [];
  for (const r of asArray(recipe?.craftresource)) {
    const entry = [r["@uniquename"], Number(r["@count"] ?? 1)];
    if (r["@uniquename"].includes("ARTEFACT")) artifacts.push(entry);
    else resources.push(entry);
  }
  return { resources, artifacts };
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

const main = async () => {
  console.log("Baixando dumps...");
  const [raw, localized] = await Promise.all([
    fetchJson(`${BASE}/items.json`),
    fetchJson(`${BASE}/formatted/items.json`),
  ]);

  const nameById = new Map();
  for (const entry of localized) {
    const en = entry?.LocalizedNames?.["EN-US"];
    if (entry?.UniqueName && en) nameById.set(entry.UniqueName, en);
  }

  const items = [];
  const resourceIds = new Set();

  const push = (node, id, tier, enchant, category, family, slot, recipe) => {
    const { resources, artifacts } = splitResources(recipe);
    if (resources.length === 0 && artifacts.length === 0) return;
    for (const [rid] of resources) resourceIds.add(rid);
    for (const [aid] of artifacts) resourceIds.add(aid);
    items.push({
      id,
      name: nameById.get(id) ?? nameById.get(node["@uniquename"]) ?? id,
      tier,
      enchant,
      category,
      family,
      slot,
      resources,
      artifacts,
    });
  };

  const collect = (node, category, family, slot) => {
    const base = node["@uniquename"];
    const tier = Number(node["@tier"]);
    if (!Number.isFinite(tier) || tier < 1) return;

    const baseRecipe = firstRecipe(node);
    if (baseRecipe) push(node, base, tier, 0, category, family, slot, baseRecipe);

    for (const ench of asArray(node.enchantments?.enchantment)) {
      const level = Number(ench["@enchantmentlevel"]);
      const recipe = firstRecipe(ench);
      if (!recipe || !level) continue;
      push(node, `${base}@${level}`, tier, level, category, family, slot, recipe);
    }
  };

  for (const w of asArray(raw.items.weapon)) {
    if (w["@shopcategory"] !== "weapons") continue;
    collect(w, "weapon", w["@shopsubcategory1"] ?? w["@craftingcategory"] ?? "other", "mainhand");
  }

  for (const e of asArray(raw.items.equipmentitem)) {
    const shop = e["@shopcategory"];
    if (!ALLOWED_SHOP_CATEGORIES.has(shop)) continue;
    const slotType = e["@slottype"];
    if (slotType === "offhand") {
      collect(e, "offhand", e["@shopsubcategory1"] ?? "offhand", "offhand");
    } else if (ARMOR_SLOTS[slotType]) {
      const family = e["@shopsubcategory1"] ?? "other"; // cloth / leather / plate
      collect(e, "armor", family, ARMOR_SLOTS[slotType]);
    }
  }

  const resources = {};
  for (const id of resourceIds) {
    const { tier, enchant, group } = parseResourceId(id);
    const stripped = id.replace(/_LEVEL[1-3]$/, "");
    const name =
      nameById.get(id) ??
      nameById.get(`${stripped}@${enchant}`) ??
      nameById.get(stripped) ??
      id;
    resources[id] = {
      name: enchant > 0 && !name.includes(".") ? `${name} .${enchant}` : name,
      tier,
      enchant,
      group: id.includes("ARTEFACT") ? "Artefatos" : group,
    };
  }

  items.sort((a, b) =>
    a.category === b.category
      ? a.family === b.family
        ? a.name.localeCompare(b.name) || a.enchant - b.enchant
        : a.family.localeCompare(b.family)
      : a.category.localeCompare(b.category),
  );

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: "https://github.com/ao-data/ao-bin-dumps (items.json + formatted/items.json)",
    items,
    resources,
  };

  await mkdir("public/data", { recursive: true });
  await writeFile(OUT, JSON.stringify(payload));
  console.log(
    `OK -> ${OUT}: ${items.length} equipamentos, ${Object.keys(resources).length} recursos/artefatos`,
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
