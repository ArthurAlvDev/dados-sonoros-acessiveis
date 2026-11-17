# Dados Sonoros (`dados-sonoros-acessiveis`)

Estúdio e explorador web no-code de gráficos SVG acessíveis, sonificação determinística via Web Audio API e tabelas semânticas sincronizadas, executado **100% no navegador** com custo zero.

## Funcionalidades

- **Entrada de Dados (`RF-01`):** Colagem de CSV/TSV (vírgula, ponto e vírgula ou tabulação), upload de arquivo `.csv` local (até 512 KB), tabela editável rápida e 3 datasets de exemplo em PT-BR.
- **Gráfico SVG Semântico (`RF-02`):** Modos Barras e Linhas com padrões visuais (`<pattern>`), marcadores geométricos distintos, `<title>`, `<desc>` e tema Alto Contraste (WCAG AAA >= 7:1).
- **Sonificação Determinística (`RF-03`):** Mapeamento Linear e Logarítmico (`220–880 Hz`, com fallback linear para valores `<= 0` e tom fixo `440 Hz` em amplitude zero), Web Audio API com envelope suave (`15ms` ataque / `40ms` decaimento), controles de Reproduzir, Pausar, Parar, Tom Mín/Máx, velocidade (`0.75x`–`2x`) e volume, com fallback seguro caso `AudioContext` não esteja disponível.
- **Exploração por Teclado e `aria-live` (`RF-04`):** Navegação ponto a ponto com `←`/`→`, `Home`/`End`, `Enter`/`Space` e sincronização bidirecional com a tabela semântica (`RF-05`).
- **Resumo Estatístico (`RF-06`):** Contagem, mínimo, máximo, média, mediana, variação e tendência calculados localmente.
- **Exportação Local (`RF-07`):** Download via `Blob` de pacote HTML+SVG autocontido (escapado contra XSS), JSON e CSV.
- **Persistência Local (`RF-08`):** Estado e preferências salvos em `localStorage` (`dados_sonoros_v1_state`) com fallback em memória.

> **Transparência WCAG:** A interface implementa boas práticas estruturais alinhadas à WCAG 2.2 AA, mas não declara conformidade certificada com leitores de tela (NVDA, VoiceOver, JAWS) sem testes reais em QA.

## Execução Local

Requer apenas **Node.js** (testado em `v24.13.1`), sem `npm install`.

```bash
# Rodar toda a suíte de testes
npm test
# ou:
node --test tests/*.test.js

# Iniciar servidor estático local em http://localhost:8080
npm run serve
```
