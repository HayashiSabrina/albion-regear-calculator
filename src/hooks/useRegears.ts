import { useCallback, useEffect, useState } from "react";

import {
  createRegear,
  deleteRegear,
  duplicateRegear,
  listRegears,
  saveRegear,
} from "@/lib/albion/regears";
import type { Regear } from "@/lib/albion/types";

export function useRegears() {
  const [regears, setRegears] = useState<Regear[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    listRegears()
      .then((all) => {
        if (!active) return;
        setRegears(all);
        setActiveId(all[0]?.id ?? null);
      })
      .catch(() => undefined)
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const upsert = useCallback((regear: Regear) => {
    setRegears((prev) => {
      const exists = prev.some((item) => item.id === regear.id);
      const next = exists ? prev.map((item) => (item.id === regear.id ? regear : item)) : [regear, ...prev];
      return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }, []);

  const update = useCallback(
    async (regear: Regear) => {
      const saved = await saveRegear(regear);
      upsert(saved);
      return saved;
    },
    [upsert],
  );

  const create = useCallback(
    async (name: string) => {
      const regear = await createRegear(name);
      upsert(regear);
      setActiveId(regear.id);
      return regear;
    },
    [upsert],
  );

  const duplicate = useCallback(
    async (source: Regear) => {
      const copy = await duplicateRegear(source);
      upsert(copy);
      setActiveId(copy.id);
      return copy;
    },
    [upsert],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteRegear(id);
      setRegears((prev) => {
        const next = prev.filter((item) => item.id !== id);
        setActiveId((current) => (current === id ? next[0]?.id ?? null : current));
        return next;
      });
    },
    [],
  );

  const active = regears.find((regear) => regear.id === activeId) ?? null;

  return { regears, active, activeId, setActiveId, ready, create, update, duplicate, remove };
}
