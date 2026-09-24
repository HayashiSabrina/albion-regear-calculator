# Party Builds / Composição da PT

## Análise da arquitetura atual (o que será reutilizado)

| Existente | Uso na nova tela |
|---|---|
| Base de itens `public/data/albion-items.v1.json` + `useAlbionData` (cache IndexedDB) | Única fonte de itens: ID, nome, tier, encantamento, família, slot |
| `itemIconUrl(itemId)` (render.albiononline.com) | Imagens dos slots |
| `tierLabel`, `formatNumber`, `formatSilver` | Rótulos VIII / .1, números, prata |
| `ItemPicker` (busca por nome, ID, tier, família, encantamento) | Base do seletor de item do slot, filtrado pelo slot clicado |
| `getMarketPrices` + `useMarketPrices` + `MarketPanel` (servidor/cidade) | Preço unitário e custo total do resumo — sem nova integração |
| `calculateCraftingRequirements` + tela de Regear atual | Botão "Craft": envia Item IDs e quantidades para um regear |
| IndexedDB `albion-regear` (`idb.ts`) | Nova store `parties` na mesma base |
| Componentes shadcn, tema escuro, `panel` | Visual |

Não há backend/banco remoto: a persistência continua 100% local no navegador, igual aos regears.

## Lacuna nos dados (precisa de decisão sua, já assumida no plano)

A base atual **exclui de propósito** capas, bolsas, montarias, comidas e poções (requisito do primeiro pedido). Para preencher os slots Cape, Bag, Mount, Food e Potion, o script de dados será ampliado para incluir esses itens da mesma fonte oficial (ao-bin-dumps), marcados com categoria própria (`cape`, `bag`, `mount`, `food`, `potion`).
- A tela de Regear atual continua filtrando só armas/armaduras/off-hands — nada muda nela.
- Capas, bolsas, comidas e poções têm receita nos dados, então também funcionam no botão Craft.

## Modelo de dados (Build separada de Regear)

```text
Party        { id, name, description, members[], createdAt, updatedAt }
PartyMember  { id, name, role, customRole?, regearSets, items[] }
BuildItem    { slot, itemId, quantityPerSet }
slot: head | chest | shoes | mainhand | offhand | cape | bag | mount | food | potion
```
Tier e encantamento derivam do Item ID (ex.: `T8_..@1` = VIII.1) — nunca do nome. Armas de duas mãos bloqueiam o slot Off Hand.

## Telas e funcionalidades

- Nova rota `/party` ("Party Builds"), link na sidebar ao lado de Regears.
- Lista de composições: criar, renomear, descrição, duplicar (cópia independente), excluir com confirmação.
- Card por player: nome, role (Tank, Healer, DPS, Support, Shotcaller, Utility, Other ou texto livre), Regear Sets, duplicar player (Tank 1 → Tank 2), remover.
- Grade de equipamentos no estilo da imagem enviada:
```text
[BAG]   [HEAD]   [CAPE]
[MAIN]  [CHEST]  [OFF]
[POT]   [SHOES]  [FOOD]
        [MOUNT]
```
  Slots vazios visíveis com X; itens com imagem oficial, selo do tier e tooltip (nome, ID, tier, encantamento). Quantidade por set editável (padrão 1; food/potion livres).
- Clique no slot abre o seletor já filtrado pelo tipo do slot. Arrastar entre slots compatíveis se ficar simples (não prioritário).
- **Resumo do Regear**: soma por Item ID de todos os players × regear sets, separado em Equipamentos e Consumíveis; colunas Item | Quantidade | Preço unitário | Total; rodapé com Total de itens e Valor total de mercado, usando o mesmo seletor servidor/cidade.
- Botão **Craft** no resumo: cria um regear na tela atual com os itens craftáveis e as quantidades totais e abre essa tela (reutiliza todo o cálculo existente).

## Detalhes técnicos

- `scripts/build-albion-data.mjs`: incluir capes/bags/mounts/food/potions; regenerar JSON (versão `v2`) e ajustar `DATASET_URL`; filtro em `ItemPicker` do Regear mantém só weapon/armor/offhand.
- `idb.ts`: versão da base +1 com store `parties`.
- Novos: `src/lib/albion/parties.ts` (CRUD + `consolidatePartyItems`), `src/hooks/useParties.ts`, `src/routes/party.tsx`, `src/components/party/{PartyList,MemberCard,GearGrid,GearSlot,SlotItemPicker,RegearSummary}.tsx`.
- Craft: criação via `createRegear` + `addLine`, navegação para `/` com o regear ativo.
