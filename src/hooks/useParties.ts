import { useCallback, useEffect, useState } from "react";

import {
  createParty,
  deleteParty,
  duplicateParty,
  listParties,
  saveParty,
  type Party,
} from "@/lib/albion/parties";

export function useParties() {
  const [parties, setParties] = useState<Party[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    listParties()
      .then((all) => {
        if (!alive) return;
        setParties(all);
        setActiveId(all[0]?.id ?? null);
      })
      .catch(() => undefined)
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const upsert = useCallback((party: Party) => {
    setParties((prev) => {
      const exists = prev.some((p) => p.id === party.id);
      return exists ? prev.map((p) => (p.id === party.id ? party : p)) : [party, ...prev];
    });
  }, []);

  const update = useCallback(
    async (party: Party) => {
      upsert(party);
      const saved = await saveParty(party);
      upsert(saved);
      return saved;
    },
    [upsert],
  );

  const create = useCallback(
    async (name: string) => {
      const party = await createParty(name);
      upsert(party);
      setActiveId(party.id);
    },
    [upsert],
  );

  const duplicate = useCallback(
    async (party: Party) => {
      const copy = await duplicateParty(party);
      upsert(copy);
      setActiveId(copy.id);
    },
    [upsert],
  );

  const remove = useCallback(async (id: string) => {
    await deleteParty(id);
    setParties((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setActiveId((current) => (current === id ? (next[0]?.id ?? null) : current));
      return next;
    });
  }, []);

  const active = parties.find((p) => p.id === activeId) ?? null;
  return { parties, active, activeId, setActiveId, ready, create, update, duplicate, remove };
}
