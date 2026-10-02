# Página de imagem das Party Builds

## Objetivo
- Trocar a impressão direta por uma nova página exclusiva para a composição ativa.
- Exibir todas as builds em uma prancha horizontal, sem menus ou elementos da tela principal.
- Gerar essa prancha como PNG e oferecer download em alta resolução.
- Aumentar e dar destaque à função de cada jogador.

## Implementação
- Criar a rota `/party/print` recebendo o ID da composição.
- Carregar a composição e os itens já salvos localmente, preservando imagens oficiais do Albion.
- Adaptar a folha atual para visualização em paisagem e captura limpa.
- Atualizar o botão da tela Party Builds para abrir essa página em uma nova aba.
- Incluir ações discretas de baixar o PNG e voltar, fora da área capturada.

## Validação
- Confirmar que todas as builds aparecem na imagem sem cortes ou sobreposições.
- Verificar o destaque da função, o download PNG e a abertura em nova página.
- Testar a página em desktop e conferir os erros da aplicação.
