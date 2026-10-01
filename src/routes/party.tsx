import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, Pencil, Plus, Save, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppNav } from "@/components/AppNav";
import { MemberCard } from "@/components/party/MemberCard";
import { RegearSummary } from "@/components/party/RegearSummary";
import { SlotItemPicker } from "@/components/party/SlotItemPicker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAlbionData } from "@/hooks/useAlbionData";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { useParties } from "@/hooks/useParties";
import { MARKET_LOCATIONS, MARKET_SERVERS, type MarketLocation, type MarketServer } from "@/lib/albion/market";
import {
  cloneMember,
  consolidatePartyItems,
  newMember,
  setMemberItem,
  type GearSlot,
  type PartyMember,
} from "@/lib/albion/parties";
import { addLine, createRegear, saveRegear } from "@/lib/albion/regears";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/party")({
  head: () => ({
    meta: [
      { title: "Party Builds — Composições do Albion Online" },
      { name: "description", content: "Monte composições de party, builds por player e o custo total do regear." },
      { property: "og:title", content: "Party Builds — Regear Forge" },
      { property: "og:description", content: "Composições de party do Albion Online com resumo e custo de regear." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PartyPage,
});

function PartyPage() {
  const navigate = useNavigate();
  const { dataset, itemIndex } = useAlbionData();
  const { parties, active, activeId, setActiveId, ready, create, update, duplicate, remove } = useParties();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [picking, setPicking] = useState<{ memberId: string; slot: GearSlot } | null>(null);
  const [server, setServer] = useState<MarketServer>("west");
  const [location, setLocation] = useState<MarketLocation>("Caerleon");

  useEffect(() => {
    const s = window.localStorage.getItem("albion-market-server") as MarketServer | null;
    const l = window.localStorage.getItem("albion-market-location") as MarketLocation | null;
    if (s) setServer(s);
    if (l) setLocation(l);
  }, []);

  useEffect(() => {
    setName(active?.name ?? "");
    setEditing(false);
  }, [active?.id, active?.name]);

  const rows = useMemo(() => consolidatePartyItems(active), [active]);
  const market = useMarketPrices(rows.map((r) => r.itemId), server, location);
  const prices = useMemo(() => new Map((market.data ?? []).map((p) => [p.itemId, p])), [market.data]);

  const setMembers = (members: PartyMember[]) => active && void update({ ...active, members });
  const changeMember = (m: PartyMember) => active && setMembers(active.members.map((x) => (x.id === m.id ? m : x)));

  const craft = async () => {
    if (!active) return;
    const regear = await createRegear(`${active.name} — Regear`);
    let lines = regear.lines;
    for (const r of rows) {
      if ((itemIndex.get(r.itemId)?.resources.length ?? 0) > 0) lines = addLine(lines, r.itemId, r.quantity);
    }
    await saveRegear({ ...regear, lines });
    void navigate({ to: "/" });
  };

  const submit = () => {
    void create(newName);
    setNewName("");
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-[1680px] gap-4 p-3 sm:p-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel flex h-fit flex-col gap-4 p-4 lg:sticky lg:top-4">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <div>
              <p className="font-display text-sm font-bold tracking-wide">PARTY BUILDS</p>
              <p className="text-[11px] text-muted-foreground">Albion Online</p>
            </div>
          </div>
          <AppNav />
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ex.: ZvZ Brawl 20"
            />
            <Button size="icon" onClick={submit} aria-label="Criar composição">
              <Plus className="size-4" />
            </Button>
          </div>
          <ul className="space-y-1">
            {parties.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  className={cn(
                    "w-full rounded-md px-2 py-2 text-left transition-colors",
                    p.id === activeId ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                  )}
                >
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="num block text-[11px] text-muted-foreground">{p.members.length} players</span>
                </button>
              </li>
            ))}
            {ready && parties.length === 0 && (
              <li className="px-2 py-6 text-xs text-muted-foreground">Crie sua primeira composição.</li>
            )}
          </ul>
        </aside>

        <div className="min-w-0 space-y-4">
          {!active ? (
            <div className="panel p-10 text-center text-sm text-muted-foreground">
              {ready ? "Crie ou selecione uma composição para começar." : "Carregando…"}
            </div>
          ) : (
            <>
              <header className="panel space-y-3 p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
                  {editing ? (
                    <div className="flex max-w-xl flex-1 gap-2">
                      <Input
                        autoFocus
                        value={name}
                        aria-label="Nome da composição"
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            void update({ ...active, name: name.trim() || "Nova Composição" });
                            setEditing(false);
                          }
                          if (e.key === "Escape") setEditing(false);
                        }}
                        className="text-lg font-semibold"
                      />
                      <Button
                        size="icon"
                        aria-label="Salvar nome"
                        onClick={() => {
                          void update({ ...active, name: name.trim() || "Nova Composição" });
                          setEditing(false);
                        }}
                      >
                        <Save />
                      </Button>
                    </div>
                  ) : (
                    <h1 className="truncate text-xl font-bold sm:text-2xl">{active.name}</h1>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      <Pencil /> Renomear
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void duplicate(active)}>
                      <Copy /> Duplicar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 /> Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir "{active.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>Essa composição e todas as builds serão apagadas.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => void remove(active.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <Textarea
                  key={active.id}
                  defaultValue={active.description}
                  placeholder="Descrição (opcional)"
                  onBlur={(e) => e.target.value !== active.description && void update({ ...active, description: e.target.value })}
                  className="min-h-14 text-sm"
                />
              </header>

              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                      Players ({active.members.length})
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setMembers([...active.members, newMember(active.members.length + 1)])}>
                      <Plus /> Adicionar player
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {active.members.map((m, idx) => (
                      <MemberCard
                        key={m.id}
                        member={m}
                        itemIndex={itemIndex}
                        onChange={changeMember}
                        onDuplicate={() => {
                          const copy = cloneMember(m, active.members.map((x) => x.name));
                          const next = [...active.members];
                          next.splice(idx + 1, 0, copy);
                          setMembers(next);
                        }}
                        onRemove={() => setMembers(active.members.filter((x) => x.id !== m.id))}
                        onPickSlot={(slot) => setPicking({ memberId: m.id, slot })}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="panel flex flex-wrap gap-2 p-3">
                    <select
                      value={server}
                      aria-label="Servidor"
                      onChange={(e) => {
                        setServer(e.target.value as MarketServer);
                        window.localStorage.setItem("albion-market-server", e.target.value);
                      }}
                      className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {MARKET_SERVERS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <select
                      value={location}
                      aria-label="Cidade"
                      onChange={(e) => {
                        setLocation(e.target.value as MarketLocation);
                        window.localStorage.setItem("albion-market-location", e.target.value);
                      }}
                      className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {MARKET_LOCATIONS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <RegearSummary rows={rows} itemIndex={itemIndex} prices={prices} loading={market.isLoading} onCraft={() => void craft()} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <SlotItemPicker
        slot={picking?.slot ?? null}
        dataset={dataset}
        onClose={() => setPicking(null)}
        onSelect={(itemId) => {
          const m = active?.members.find((x) => x.id === picking?.memberId);
          if (m && picking) changeMember(setMemberItem(m, picking.slot, itemId));
          setPicking(null);
        }}
      />
    </main>
  );
}
