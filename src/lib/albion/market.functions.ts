import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { MARKET_LOCATIONS, MARKET_SERVERS, toMarketItemId, type MarketPrice } from "./market";

const inputSchema = z.object({
  server: z.enum(MARKET_SERVERS.map((server) => server.value) as ["west", "europe", "east"]),
  location: z.enum(MARKET_LOCATIONS),
  itemIds: z.array(z.string().min(1).max(160)).max(500),
});

interface ApiPrice {
  item_id: string;
  city: string;
  sell_price_min: number;
  sell_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

const validDate = (value: string) => (value.startsWith("0001-") ? null : value);

export const getMarketPrices = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<MarketPrice[]> => {
    const ids = [...new Set(data.itemIds)];
    if (ids.length === 0) return [];

    // IDs da API (recursos encantados usam sufixo @n) -> IDs do dataset.
    const idByMarketId = new Map<string, string>();
    for (const id of ids) idByMarketId.set(toMarketItemId(id), id);
    const marketIds = [...idByMarketId.keys()];

    const chunks: string[][] = [];
    for (let index = 0; index < marketIds.length; index += 80)
      chunks.push(marketIds.slice(index, index + 80));

    const responses = await Promise.all(
      chunks.map(async (chunk) => {
        const url = new URL(
          `/api/v2/stats/prices/${chunk.map(encodeURIComponent).join(",")}.json`,
          `https://${data.server}.albion-online-data.com`,
        );
        url.searchParams.set("locations", data.location);
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Mercado do Albion indisponível [${response.status}]: ${body.slice(0, 180)}`);
        }
        return (await response.json()) as ApiPrice[];
      }),
    );

    // Consolida todas as qualidades: menor venda e maior compra por item.
    const merged = new Map<string, MarketPrice>();
    for (const price of responses.flat()) {
      const itemId = idByMarketId.get(price.item_id) ?? price.item_id;
      const current =
        merged.get(itemId) ??
        ({
          itemId,
          city: price.city,
          sellPriceMin: null,
          sellPriceMinDate: null,
          buyPriceMax: null,
          buyPriceMaxDate: null,
        } satisfies MarketPrice);

      if (price.sell_price_min > 0 && (current.sellPriceMin == null || price.sell_price_min < current.sellPriceMin)) {
        current.sellPriceMin = price.sell_price_min;
        current.sellPriceMinDate = validDate(price.sell_price_min_date);
      }
      if (price.buy_price_max > 0 && (current.buyPriceMax == null || price.buy_price_max > current.buyPriceMax)) {
        current.buyPriceMax = price.buy_price_max;
        current.buyPriceMaxDate = validDate(price.buy_price_max_date);
      }
      merged.set(itemId, current);
    }

    return [...merged.values()];
  });
