# Preços de mercado em tempo real

## Implementação
- Consultar a API pública do Albion Online Data Project, sem chave ou cadastro, preservando os regears locais.
- Adicionar seletores de servidor e mercado, com todas as cidades principais e Mercado Negro quando disponível.
- Buscar preços em lotes para equipamentos, recursos e artefatos do regear ativo, respeitando os Item IDs e encantamentos.
- Exibir menor venda e maior compra por unidade, subtotal por linha e totais consolidados em prata.
- Mostrar horário real de cada cotação, estado de atualização e aviso claro quando um preço estiver ausente ou antigo.
- Manter a escolha de servidor e cidade no navegador e permitir atualização manual, com cache curto para evitar consultas repetidas.

## Detalhes técnicos
- Usar os endpoints regionais públicos do Albion Online Data Project: Americas, Asia e Europe.
- Considerar qualidade normal como referência de cálculo e ignorar valores zero, que representam ausência de ordem.
- Dividir listas extensas em lotes para evitar URLs grandes; indisponibilidade da API não bloqueará a calculadora.

## Validação
- Testar cidades e servidores diferentes, menor venda e maior compra, atualização manual e itens sem cotação.
- Confirmar totais de equipamentos, recursos e artefatos em desktop e celular.
