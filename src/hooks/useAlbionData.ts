import { useEffect, useMemo, useState } from "react";

import { loadDataset } from "@/lib/albion/dataSource";
import { buildItemIndex } from "@/lib/albion/crafting";
import type { AlbionDataset } from "@/lib/albion/types";

export function useAlbionData() {
  const [dataset, setDataset] = useState<AlbionDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadDataset((cached) => {
      if (active) {
        setDataset(cached);
        setLoading(false);
      }
    })
      .then(({ dataset: data, fromCache: cache }) => {
        if (!active) return;
        setDataset(data);
        setFromCache(cache);
        setError(null);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const itemIndex = useMemo(() => (dataset ? buildItemIndex(dataset.items) : new Map()), [dataset]);

  return { dataset, itemIndex, loading, fromCache, error };
}
