import { SLOT_LABELS, itemIconUrl, itemTierLabel } from "@/lib/albion/format";
import { isTwoHanded, type GearSlot, type Party } from "@/lib/albion/parties";
import type { EquipmentItem } from "@/lib/albion/types";

const GRID: (GearSlot | null)[] = [
  "bag", "head", "cape",
  "mainhand", "chest", "offhand",
  "potion", "shoes", "food",
  null, "mount", null,
];

interface Props {
  party: Party;
  itemIndex: Map<string, EquipmentItem>;
}

/**
 * Folha de impressão: renderizada escondida na tela e visível apenas em @media print.
 * Mostra todas as builds da composição em grade clara, com imagens do render.albiononline.com.
 */
export function PartyPrintSheet({ party, itemIndex }: Props) {
  const printedAt = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="print-sheet" aria-hidden="true">
      <header className="print-header">
        <div>
          <h1>{party.name}</h1>
          {party.description && <p className="print-desc">{party.description}</p>}
        </div>
        <p className="print-meta">
          {party.members.length} players · impresso em {printedAt}
        </p>
      </header>

      <div className="print-grid">
        {party.members.map((m) => {
          const bySlot = new Map(m.items.map((i) => [i.slot, i]));
          const twoHanded = isTwoHanded(bySlot.get("mainhand")?.itemId);
          return (
            <section key={m.id} className="print-card">
              <div className="print-card-head">
                <strong>{m.name}</strong>
                <span>
                  {m.role}
                  {m.regearSets > 0 && ` · ${m.regearSets} set${m.regearSets > 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="print-slots">
                {GRID.map((slot, idx) => {
                  if (!slot) return <span key={`e-${idx}`} />;
                  const entry = bySlot.get(slot);
                  const item = entry ? itemIndex.get(entry.itemId) : undefined;
                  const blocked = slot === "offhand" && twoHanded;
                  return (
                    <div key={slot} className={`print-slot${entry ? " filled" : ""}${blocked ? " blocked" : ""}`}>
                      {entry ? (
                        <>
                          <img src={itemIconUrl(entry.itemId)} alt={item?.name ?? entry.itemId} />
                          {item && <em>{itemTierLabel(item)}</em>}
                          {entry.quantityPerSet > 1 && <b>×{entry.quantityPerSet}</b>}
                        </>
                      ) : (
                        <i>✕</i>
                      )}
                      <small>{SLOT_LABELS[slot] ?? slot}</small>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
