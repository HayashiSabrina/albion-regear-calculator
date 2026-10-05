import { SLOT_LABELS, itemTierLabel } from "@/lib/albion/format";
import { isTwoHanded, type GearSlot, type Party } from "@/lib/albion/parties";
import type { EquipmentItem } from "@/lib/albion/types";
import morsLogo from "@/assets/mors-logo.png.asset.json";

const GRID: (GearSlot | null)[] = [
  "bag", "head", "cape",
  "mainhand", "chest", "offhand",
  "potion", "shoes", "food",
  null, "mount", null,
];

interface Props {
  party: Party;
  itemIndex: Map<string, EquipmentItem>;
  captureId?: string;
}

/**
 * Prancha horizontal usada tanto na prévia quanto na exportação PNG.
 * As imagens vêm do render.albiononline.com e o conteúdo é dimensionado para 1600px.
 */
export function PartyPrintSheet({ party, itemIndex, captureId }: Props) {
  const printedAt = new Date().toLocaleDateString("pt-BR");

  return (
    <div id={captureId} className="party-image-sheet">
      <img className="print-watermark" src={morsLogo.url} crossOrigin="anonymous" alt="" />
      <header className="print-header">
        <div className="print-title-group">
          <img className="print-brand-logo" src={morsLogo.url} crossOrigin="anonymous" alt="MORS" />
          <div>
          <h1>{party.name}</h1>
          {party.description && <p className="print-desc">{party.description}</p>}
          </div>
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
                <span className="print-role">{m.role || "SEM FUNÇÃO"}</span>
                {m.regearSets > 0 && (
                  <small className="print-sets">{m.regearSets} set{m.regearSets > 1 ? "s" : ""}</small>
                )}
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
                          <img
                            src={`/api/public/item-icon/${encodeURIComponent(entry.itemId)}`}
                            crossOrigin="anonymous"
                            alt={item?.name ?? entry.itemId}
                          />
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
