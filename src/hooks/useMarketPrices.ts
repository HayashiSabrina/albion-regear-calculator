import { useQuery } from "@tanstack/react-query";

import { getMarketPrices } from "@/lib/albion/market.functions";
import type { MarketLocation, MarketServer } from "@/lib/albion/market";

export function useMarketPrices(
  itemIds: string[],
  server: MarketServer,
  location: MarketLocation,
) {
  const stableIds = [...new Set(itemIds)].sort();
  return useQuery({
    queryKey: ["albion-market", server, location, stableIds],
    queryFn: () => getMarketPrices({ data: { server, location, itemIds: stableIds } }),
    enabled: stableIds.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}