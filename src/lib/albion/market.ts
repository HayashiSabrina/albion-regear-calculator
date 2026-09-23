export const MARKET_SERVERS = [
  { value: "west", label: "Americas" },
  { value: "europe", label: "Europa" },
  { value: "east", label: "Ásia" },
] as const;

export const MARKET_LOCATIONS = [
  "Caerleon",
  "Bridgewatch",
  "Fort Sterling",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Brecilien",
  "Black Market",
] as const;

export type MarketServer = (typeof MARKET_SERVERS)[number]["value"];
export type MarketLocation = (typeof MARKET_LOCATIONS)[number];

export interface MarketPrice {
  itemId: string;
  city: string;
  sellPriceMin: number | null;
  sellPriceMinDate: string | null;
  buyPriceMax: number | null;
  buyPriceMaxDate: string | null;
}

/**
 * Recursos refinados encantados vêm do dump como `T4_CLOTH_LEVEL1`, mas o
 * Albion Online Data Project os indexa como `T4_CLOTH_LEVEL1@1`.
 */
export function toMarketItemId(itemId: string) {
  if (itemId.includes("@")) return itemId;
  const match = /_LEVEL([1-4])$/.exec(itemId);
  return match ? `${itemId}@${match[1]}` : itemId;
}

export const formatSilver = (value: number | null | undefined) =>
  value == null ? "—" : `${Math.round(value).toLocaleString("pt-BR")} 🜲`;


export function newestMarketDate(prices: MarketPrice[]) {
  const dates = prices.flatMap((price) =>
    [price.sellPriceMinDate, price.buyPriceMaxDate].filter((date): date is string => Boolean(date)),
  );
  return dates.sort().at(-1) ?? null;
}

export function isStaleMarketDate(value: string | null, hours = 24) {
  if (!value) return false;
  const time = new Date(`${value}Z`).getTime();
  return Number.isFinite(time) && Date.now() - time > hours * 60 * 60 * 1000;
}