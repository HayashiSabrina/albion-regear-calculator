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

    const chunks: string[][] = [];
    for (let index = 0; index < ids.length; index += 80) chunks.push(ids.slice(index, index + 80));

    const responses = await Promise.all(
      chunks.map(async (chunk) => {
        const url = new URL(
          `/api/v2/stats/prices/${chunk.map(encodeURIComponent).join(",")}.json`,
          `https://${data.server}.albion-online-data.com`,
        );
        url.searchParams.set("locations", data.location);
        url.searchParams.set("qualities", "1");
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Mercado do Albion indisponível [${response.status}]: ${body.slice(0, 180)}`);
        }
        return (await response.json()) as ApiPrice[];
      }),
    );

    return responses.flat().map((price) => ({
      itemId: price.item_id,
      city: price.city,
      sellPriceMin: price.sell_price_min > 0 ? price.sell_price_min : null,
      sellPriceMinDate: validDate(price.sell_price_min_date),
      buyPriceMax: price.buy_price_max > 0 ? price.buy_price_max : null,
      buyPriceMaxDate: validDate(price.buy_price_max_date),
    }));
  });