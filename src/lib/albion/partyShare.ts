// Serialização compacta de uma composição para o hash da URL (#data=...).
// Usada apenas como fallback de /party/print quando a nova aba não enxerga o
// IndexedDB da aba original (ex.: prévia em iframe). Síncrono para que o
// window.open aconteça dentro do clique e não seja bloqueado como pop-up.

import type { GearSlot, Party } from "./parties";

const SLOTS: GearSlot[] = ["bag", "head", "cape", "mainhand", "chest", "offhand", "potion", "shoes", "food", "mount"];

type Compact = [
  id: string,
  name: string,
  description: string,
  members: [name: string, role: string, sets: number, items: [slot: number, itemId: string, qty: number][]][],
];

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function encodePartyForUrl(party: Party): string {
  const compact: Compact = [
    party.id,
    party.name,
    party.description,
    party.members.map((m) => [
      m.name,
      m.role,
      m.regearSets,
      m.items.map((i) => [SLOTS.indexOf(i.slot), i.itemId, i.quantityPerSet]),
    ]),
  ];
  return toBase64Url(JSON.stringify(compact));
}

export function decodePartyFromUrl(value: string): Party | null {
  try {
    const [id, name, description, members] = JSON.parse(fromBase64Url(value)) as Compact;
    if (typeof id !== "string" || typeof name !== "string" || !Array.isArray(members)) return null;
    const now = new Date().toISOString();
    return {
      id,
      name,
      description: typeof description === "string" ? description : "",
      createdAt: now,
      updatedAt: now,
      members: members.map(([mName, role, sets, items], idx) => ({
        id: `url-${idx}`,
        name: String(mName),
        role: String(role ?? ""),
        regearSets: Number(sets) || 0,
        items: (Array.isArray(items) ? items : []).flatMap(([slotIdx, itemId, qty]) => {
          const slot = SLOTS[slotIdx];
          return slot && typeof itemId === "string"
            ? [{ slot, itemId, quantityPerSet: Number(qty) || 1 }]
            : [];
        }),
      })),
    };
  } catch {
    return null;
  }
}

export function readPartyFromHash(): Party | null {
  const match = /(?:^#|&)data=([^&]+)/.exec(window.location.hash);
  return match?.[1] ? decodePartyFromUrl(match[1]) : null;
}

export const partyPrintUrl = (party: Party) =>
  `/party/print?id=${encodeURIComponent(party.id)}#data=${encodePartyForUrl(party)}`;
