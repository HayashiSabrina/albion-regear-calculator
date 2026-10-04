# Albion Regear Calculator

Crie uma aplicação web para calcular e gerenciar materiais necessários para crafting de equipamentos de REGEAR do Albion Online.

OBJETIVO

Quero uma ferramenta simples e rápida para jogadores de Albion Online que permita:

Selecionar equipamentos que fazem parte de um regear.

Informar a quantidade desejada de cada equipamento.

Mostrar automaticamente todos os recursos necessários para fabricar esses equipamentos.

Mostrar os artefatos necessários separadamente.

Salvar no navegador todas as inserções feitas pelo usuário.

Permitir editar, remover e criar diferentes configurações de regear.

Não exigir login, backend ou banco de dados para os dados do usuário.

A aplicação deve ser focada EXCLUSIVAMENTE em equipamentos.

IMPORTANTE — O QUE NÃO DEVE SER INCLUÍDO

NÃO incluir:

Capas / Capes

Bolsas / Bags

Comidas

Poções

Montarias

Consumíveis

Itens de decoração

Recursos que não sejam necessários para equipamentos

Itens aleatórios que não façam parte do crafting de equipamentos

Sistema de marketplace

Sistema de preços

Sistema de compra/venda

Login

Cadastro de usuários

Backend para armazenar os regears

O foco é somente:

Armas

Armaduras

Capacetes

Botas

Off-hands

Artefatos necessários para esses equipamentos

FONTE DOS DADOS

Não invente os dados dos itens.

O sistema deve obter a lista de equipamentos e suas receitas de crafting a partir de uma fonte confiável dos dados do Albion Online.

Prioridade:

JSON/API oficial ou fonte de dados oficial do Albion Online, se disponível.

Caso os dados oficiais não forneçam diretamente as receitas, utilizar uma fonte pública confiável que contenha os dados de crafting do Albion Online.

Estruturar o código de forma que a fonte dos dados possa ser substituída facilmente no futuro.

Antes de implementar, pesquise/verifique qual é atualmente a melhor fonte pública de dados para:

Item ID

Nome do item

Tier

Encantamento

Categoria

Receita de crafting

Recursos necessários

Quantidade de cada recurso

Artefatos necessários

Não criar manualmente uma lista pequena de itens apenas como exemplo.

A aplicação deve ser preparada para trabalhar com a lista completa de equipamentos disponíveis nos dados utilizados.

EQUIPAMENTOS

A interface deve organizar os equipamentos por categorias:

Armas

Separar por famílias de armas e mostrar todas as armas disponíveis.

Exemplo:

Swords

Axes

Maces

Hammers

Spears

Daggers

Quarterstaffs

Bows

Crossbows

Fire Staffs

Frost Staffs

Arcane Staffs

Holy Staffs

Nature Staffs

Cursed Staffs

War Gloves

Shapeshifter Staffs

etc.

A lista deve ser derivada dos dados reais, e não limitada aos exemplos acima.

Armaduras

Cloth

Leather

Plate

Dentro delas:

Head

Chest

Shoes

Off-hands

Incluir somente os off-hands/equipamentos que realmente possuam receita de crafting nos dados.

TIERS E ENCHANTMENTS

O sistema precisa diferenciar corretamente:

T4

T4.1

T4.2

T4.3

T5

T5.1

T5.2

T5.3

T6

T6.1

T6.2

T6.3

T7

T7.1

T7.2

T7.3

T8

T8.1

T8.2

T8.3

Não tratar T4.1 simplesmente como T4.

O item selecionado deve manter seu Item ID correto.

SISTEMA DE REGEAR

Criar uma área chamada:

"Regear"

O usuário poderá criar uma configuração, por exemplo:

"ZvZ Holy Healer"

Dentro dela poderá adicionar equipamentos:

10x item A

10x item B

10x item C

20x item D

Cada linha deve possuir:

Equipamento

Tier/Enchant

Quantidade

Remover

Exemplo:

EquipamentoTierQuantidadeItem XT8.110Item YT7.310Item ZT6.120

CÁLCULO DE RECURSOS

Depois de adicionar os equipamentos, calcular automaticamente o total de materiais necessários.

Exemplo conceitual:

10 × Item A
+
20 × Item B
+
10 × Item C

=

Total:

15,000 × Resource A

8,000 × Resource B

2,000 × Resource C

50 × Artifact A

20 × Artifact B

O cálculo precisa percorrer as receitas dos itens selecionados e somar os materiais.

Não mostrar somente os materiais da receita individual.

Mostrar o TOTAL consolidado de todos os equipamentos selecionados.

ARTEFATOS

Os artefatos devem possuir uma seção própria.

Exemplo:

Artefatos necessários

ArtefatoQuantidadeArtifact A20Artifact B35

Não misturar artefatos com recursos normais.

Se um item não exigir artefato, obviamente não mostrar nenhum.

RECURSOS

Agrupar os recursos por tipo.

Exemplo:

Fibers

Fiber T6 — 12,000

Fiber T7 — 8,000

Leather

Leather T6 — 5,000

Leather T7 — 4,000

Ore

Ore T6 — 7,000

Wood

Wood T6 — 3,000

Stone

Stone T6 — 1,000

A categorização deve vir dos dados dos itens/recursos.

BUSCA

Adicionar uma busca rápida de equipamentos.

O usuário deve conseguir pesquisar por:

Nome

Item ID

Tier

Categoria

Exemplo:

Pesquisar:

"Kingmaker"

Deve encontrar os itens correspondentes.

A busca deve ser rápida mesmo com uma grande quantidade de itens.

FILTROS

Adicionar filtros:

Categoria

Tipo

Tier

Enchantment

Exemplo:

Category: Weapon
Tier: T8
Enchant: .1

Mostrar somente os equipamentos correspondentes.

ARMAZENAMENTO NO NAVEGADOR

IMPORTANTE:

Todos os dados inseridos pelo usuário devem ser persistidos localmente no navegador.

Não usar backend para isso.

Utilizar preferencialmente:

IndexedDB

ou, caso a quantidade de dados seja pequena:

localStorage.

A estrutura deve permitir salvar:

Nome do Regear

Equipamentos selecionados

Item IDs

Tiers

Enchantments

Quantidades

Data de criação

Data de última alteração

Quando o usuário fechar o navegador e abrir novamente, seus regears devem continuar disponíveis.

Exemplo:

Meus Regears

ZvZ

Small Scale

Solo

Hellgate

Ao clicar em "ZvZ", carregar exatamente os equipamentos e quantidades anteriormente salvos.

CRUD DOS REGEARS

Permitir:

Criar regear

Renomear regear

Editar regear

Duplicar regear

Excluir regear

Antes de excluir, mostrar confirmação.

Exemplo:

"Tem certeza que deseja excluir este regear?"

DUPLICAR REGEAR

Muito importante.

Adicionar botão:

"Duplicar"

Isso deve criar uma cópia completa do regear atual.

Exemplo:

ZvZ Healer

→ Duplicar

→ ZvZ Healer 2

O usuário poderá então alterar apenas algumas quantidades.

INTERFACE

Quero uma interface moderna, limpa e rápida.

Inspirada visualmente em ferramentas de Albion Online, mas NÃO copiar diretamente nenhuma interface existente.

Priorizar:

Dark mode

Boa legibilidade

Poucos elementos desnecessários

Tabelas

Busca rápida

Filtros

Layout responsivo

Desktop como prioridade

Mobile utilizável

ESTRUTURA SUGERIDA

Sidebar:

REGEARS

Todos

Criar Regear

Favoritos

EQUIPAMENTOS

Weapons

Armor

Off-hand

Ao selecionar um regear:

Header:

Nome do Regear

[Editar] [Duplicar] [Excluir]

Corpo:

Equipamentos

Tabela com:

Equipamento | Tier | Quantidade | Remover

Depois:

Recursos necessários

Tabela agrupada por tipo.

Depois:

Artefatos necessários

Tabela com:

Artefato | Quantidade

IMPORTANTE SOBRE O CÁLCULO

Criar uma camada separada para cálculo das receitas.

Exemplo conceitual:

calculateCraftingRequirements(items)

Essa função deve:

Receber os equipamentos selecionados.

Buscar a receita de cada Item ID.

Multiplicar os materiais pela quantidade do equipamento.

Somar materiais iguais.

Separar recursos normais de artefatos.

Retornar um objeto consolidado.

Isso deve ficar separado da interface.

Não colocar toda a lógica de cálculo diretamente nos componentes React.

DADOS

Criar uma camada de dados:

/data
/items
/recipes
/resources

ou uma estrutura equivalente.

O sistema deve conseguir atualizar os dados do Albion sem precisar reescrever a interface.

Se a API/JSON possuir IDs internos, utilizar os IDs como identificadores principais.

Nunca utilizar apenas o nome do item como identificador.

OFFLINE / CACHE DOS DADOS

Além dos regears criados pelo usuário, considerar cache local dos dados de itens/receitas.

Quando os dados forem baixados da fonte:

Buscar dados atualizados.

Armazenar uma cópia local.

Utilizar o cache nas próximas sessões.

Atualizar quando necessário.

Mostrar no sistema a data da última atualização dos dados.

Exemplo:

"Dados atualizados em: 14/09/2026"

Se a fonte externa estiver indisponível, utilizar os dados armazenados em cache.

IMPORTANTE — NÃO CRIAR MOCK DESNECESSÁRIO

Não quero uma aplicação demonstrativa com 10 itens fictícios.

Quero a arquitetura pronta para utilizar a base completa de equipamentos do Albion Online.

Se durante o desenvolvimento a fonte dos dados tiver alguma limitação, documentar claramente no código:

De onde os dados vêm.

Qual endpoint/arquivo é utilizado.

Qual formato JSON é esperado.

Como atualizar os dados.

TECNOLOGIA

Pode utilizar:

React

TypeScript

Vite

Tailwind

shadcn/ui

IndexedDB

Priorizar código organizado e fácil de manter.

EXPERIÊNCIA DO USUÁRIO

A operação principal deve ser muito rápida:

Abrir Regear.

Pesquisar equipamento.

Selecionar Tier/Enchant.

Colocar quantidade.

Adicionar.

Ver imediatamente os recursos totais.

Evitar telas desnecessárias.

Não quero um sistema cheio de funcionalidades que não ajudam no cálculo de regear.

RESULTADO FINAL

O produto final deve ser essencialmente:

"Uma calculadora de materiais de crafting para regears de equipamentos do Albion Online, com persistência local dos regears no navegador."

O foco é precisão dos dados, cálculo correto, facilidade de uso e persistência local.

Antes de implementar a interface completa, valide primeiro a fonte de dados do Albion Online e confirme que é possível obter a relação completa de equipamentos + receitas + recursos + artefatos.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/04e37318-1b93-45bc-998e-8f0128015a90).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
