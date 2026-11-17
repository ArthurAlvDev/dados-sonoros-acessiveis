# ARCHITECTURE — Dados Sonoros (`dados-sonoros-acessiveis`)

**Projeto:** `dados-sonoros-acessiveis`  
**Produto:** Dados Sonoros — Estúdio e Explorador Web No-Code de Gráficos Acessíveis, Sonificação de Dados e Tabelas Semânticas (`ACC-004`)  
**Tarefa:** `DSA-02A`  
**Data:** 2026-11-17  
**Responsável:** Software Architect (`software-architect`)  
**Entradas de referência:** [REQUIREMENTS.md](./REQUIREMENTS.md) · [PRODUCT_SPEC.md](./PRODUCT_SPEC.md)

---

## 1. Visão Geral da Arquitetura e Restrições

O **Dados Sonoros** é uma aplicação web estática de página única (*Single-Page Application* sem framework), executada **100% no navegador do usuário** com **custo zero absoluto**:

- **Zero backend / zero banco remoto:** nenhuma API, servidor de aplicação ou persistência externa.
- **Zero IA paga / zero telemetria / zero rede em runtime:** parsing de CSV, cálculo estatístico, geração SVG, síntese sonora (Web Audio API) e exportação acontecem exclusivamente em memória local.
- **Módulos UMD leves (`0` dependências):** arquivos em `src/js/` carregados em ordem via `<script defer>` (compatível com `http://localhost` e `file://`, anexando em `globalThis.DadosSonoros`) e exportando via `module.exports` para testes nativos em Node.js (`node --test`).
- **Transparência WCAG:** a arquitetura implementa boas práticas estruturais alinhadas à **WCAG 2.2 AA**, mas **não declara conformidade certificada com leitores de tela** (NVDA, VoiceOver, JAWS) até que testes reais com esses leitores sejam executados na fase de QA.
- **Governança:** não criar repositório público no GitHub, não gastar dinheiro, não comprar domínio e não publicar na Vercel.

```text
+-----------------------------------------------------------------------------+
| Navegador (100% Client-Side)                                                |
|                                                                             |
|  index.html + tokens.css + main.css                                         |
|       │                                                                     |
|       ▼                                                                     |
|  app.js (DOM/SVG seguro via createElement/createElementNS + teclado ←/→)    |
|    ├──► datasets.js     (datasets de exemplo em PT-BR)                      |
|    ├──► csv-parser.js   (parser/validador CSV/TSV seguro e limites)         |
|    ├──► stats.js        (mín, máx, média, mediana, variação, tendência)     |
|    ├──► sonifier.js     (Linear/Log 220–880Hz + Web Audio API c/ fallback)  |
|    ├──► chart-model.js  (modelo SVG barras/linhas + padrões + texto ARIA)   |
|    ├──► storage.js      (localStorage `dados_sonoros_v1_state` + fallback)  |
|    └──► exporter.js     (Blob: HTML+SVG autocontido, JSON e CSV)            |
+-----------------------------------------------------------------------------+
```

---

## 2. Estrutura Exata de Diretórios e Arquivos

O Frontend Developer deve criar os arquivos abaixo em `C:\Users\Chief\OpenBot\Shared\AI-STARTUP-FACTORY\projects\dados-sonoros-acessiveis\`:

```text
dados-sonoros-acessiveis/
├── PRODUCT_SPEC.md            # (existente) Especificação de produto
├── REQUIREMENTS.md            # (existente) Requisitos, WCAG 2.2 AA e CAs
├── ARCHITECTURE.md            # (este documento) Arquitetura e contratos
├── package.json               # Privado, 0 dependências; scripts `test` e `serve`
├── index.html                 # HTML5 semântico, SEO, OG, favicon SVG inline, CSP
├── robots.txt                 # Diretiva simples estática
├── src/
│   ├── styles/
│   │   ├── tokens.css         # Design tokens (`default` e `high-contrast`), foco, reduced-motion
│   │   └── main.css           # Layout responsivo (320px–1440px+), alvos >= 24x24px/44x44px
│   └── js/
│       ├── datasets.js        # 3+ datasets de exemplo em PT-BR
│       ├── csv-parser.js      # Parser e validador CSV/TSV com limites defensivos
│       ├── stats.js           # Cálculo estatístico determinístico
│       ├── sonifier.js        # Mapeamento de frequências + engine Web Audio API c/ fallback
│       ├── chart-model.js     # Modelo geométrico SVG (barras/linhas), padrões e anúncio ARIA
│       ├── storage.js         # Persistência `dados_sonoros_v1_state` + fallback em memória
│       ├── exporter.js        # Exportação HTML+SVG acessível, JSON e CSV via Blob
│       └── app.js             # Orquestração UI, tabela editável, teclado e aria-live
└── tests/
    ├── csv-parser.test.js     # Delimitadores `,`, `;`, `\t`, erros de validação e limites
    ├── stats.test.js          # Mín, máx, média, mediana, variação e tendência
    ├── sonifier.test.js       # Linear, log, constante (440Hz) e fallback sem AudioContext
    ├── chart-model.test.js    # Modelo barras/linhas, padrões e textos de anúncio ARIA
    ├── storage.test.js        # Persistência, JSON corrompido e fallback em memória
    ├── exporter.test.js       # HTML+SVG escapado contra XSS, JSON e CSV
    └── dom-smoke.test.js      # Auditoria estática: SEO, WCAG 2.2 AA, anti-XSS, zero rede
```

---

## 3. Contratos de Dados, Estado e Módulos Puros

### 3.1 Estado Persistido (`storage.js` — chave `dados_sonoros_v1_state`)

```ts
type ChartType = 'bar' | 'line';
type ThemeMode = 'default' | 'high-contrast';
type AudioScale = 'linear' | 'log';

interface DataRow {
  label: string; // máx. 80 chars, não vazio
  value: number; // finito (Number.isFinite)
}

interface PersistedState {
  version: 1;
  title: string;                // máx. 120 chars
  chartType: ChartType;         // 'bar' | 'line'
  theme: ThemeMode;             // 'default' | 'high-contrast'
  audioScale: AudioScale;       // 'linear' | 'log'
  playbackRate: 0.75 | 1 | 1.5 | 2;
  rows: DataRow[];              // 2..500 pontos
}
```

### 3.2 Parser e Validador CSV/TSV (`csv-parser.js`)

- **Entrada:** texto CSV/TSV com suporte a delimitadores `,`, `;` ou `\t` (autodetectado na primeira linha não vazia) e campos entre aspas duplas (`"..."`).
- **Cabeçalho opcional:** se a primeira linha tiver 2ª coluna não numérica (ex.: `Mês,Temperatura`), tratá-la como cabeçalho e ignorá-la nos pontos numéricos.
- **Validação estrita:**
  - Suportar separador decimal `.` ou `,` (ex.: `24,5` → `24.5` quando delimitador for `;` ou `\t`).
  - Rejeitar com erro estruturado (`{ ok: false, error, line }`) se houver valor não numérico indicando a linha exata, ou se o total de pontos válidos for `< 2`, preservando o texto original no campo de entrada para edição (`PRODUCT_SPEC.md` §5).
- **Limites defensivos (`RNF-03`):**
  - Máximo de **500 linhas de dados** (garantindo parsing + estatísticas + renderização em `< 150ms`).
  - Máximo de **512 KB** em upload de arquivo `.csv`.

### 3.3 Cálculo Estatístico Determinístico (`stats.js`)

```ts
interface StatsSummary {
  count: number;
  min: { label: string; value: number; index: number };
  max: { label: string; value: number; index: number };
  mean: number;
  median: number;
  changeAbs: number;           // último - primeiro
  changePct: number | null;    // null se primeiro === 0
  trend: 'crescente' | 'decrescente' | 'estável';
}
```

- **Regra de tendência:** comparar primeiro vs último valor (ou regressão linear simples / variação relativa `> 2%` para `crescente`, `< -2%` para `decrescente`, caso contrário `estável`), documentada e testada deterministicamente.

### 3.4 Sonificação Determinística e Web Audio API (`sonifier.js`)

- **Funções puras (testáveis no Node):**
  - `mapValueToFrequency(value, minVal, maxVal, { scale = 'linear', minFreq = 220, maxFreq = 880 })`:
    - Se `maxVal === minVal`: retorna `440` Hz.
    - Se `scale === 'log'` e `minVal > 0` e `value > 0`: normaliza usando `Math.log10(value)`. Se houver valor `<= 0`, faz fallback determinístico para escala linear e sinaliza `usedFallbackLinear: true`.
    - Caso padrão (`linear`): `minFreq + ((value - minVal) / (maxVal - minVal)) * (maxFreq - minFreq)`.
- **Engine de Áudio no Browser:**
  - `isWebAudioSupported()`: verifica `window.AudioContext || window.webkitAudioContext`.
  - **Regra `ACC-01`:** nunca instanciar ou iniciar `AudioContext` no carregamento da página; somente após clique ou tecla explícita do usuário.
  - Usa `OscillatorNode` (`type: 'triangle'` ou `'sine'`) + `GainNode` com ataque de `15ms` e decaimento suave de `40ms` para evitar cliques sonoros.
  - Suporta `playSeries`, `pause`, `stop`, `playPoint(index)` e `playReferenceMinMax()`.
  - **Fallback (`RNF-04` / `CA-06`):** se `AudioContext` não existir ou lançar erro, retorna `{ supported: false, reason }` e mantém exploração por teclado, `aria-live`, gráfico SVG, estatísticas, tabela e exportação 100% operacionais.

### 3.5 Modelo de Gráfico SVG e Anúncio ARIA (`chart-model.js`)

- Gera estrutura de dados pura (`buildChartModel(rows, chartType, options)`) com viewBox fixo (ex.: `720 x 360`), eixos, coordenadas de barras/pontos, IDs de padrões SVG (`<pattern>` distintos para barra normal, barra ativa e alto contraste — `ACC-02`) e `formatPointAnnouncement(rows, index)` para o `aria-live="polite"`:
  - Ex.: `"Ponto 3 de 6: Março, valor 42. Variação de +12 em relação a Fevereiro."`

### 3.6 Exportação Local via `Blob` (`exporter.js`)

- **`buildAccessibleHtmlPackage(state, stats, chartModel)`:** gera documento HTML5 autocontido (`<!DOCTYPE html><html lang="pt-BR">...`) com CSS inline de alto contraste, gráfico SVG semântico (`<title>`, `<desc>`, padrões visuais), resumo estatístico e `<table>` completa (`<caption>`, `<th scope="col">`). Todo conteúdo textual vindo do usuário passa por `escapeHtml()`.
- **`buildJsonExport(state, stats)`:** `{ exportedAt, title, summary, rows }`.
- **`buildCsvExport(rows)`:** CSV normalizado com cabeçalho `label,value` e escape RFC 4180 para aspas/delimitadores.
- Download no navegador via `new Blob([content], { type })` + `URL.createObjectURL`.

---

## 4. Segurança Estrita, Anti-XSS e Regras de `localStorage`

1. **Proibição de sinks HTML inseguros:** é proibido usar `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` ou `new Function` em qualquer arquivo `.js`.
2. **Construção segura de DOM e SVG:**
   - Elementos HTML criados apenas com `document.createElement(...)` e texto inserido via `element.textContent = ...`.
   - Elementos SVG criados apenas com `document.createElementNS('http://www.w3.org/2000/svg', tag)` e `textContent` / `setAttribute` seguros (coordenadas numéricas, `aria-*`, `fill="url(#pattern-...)"`).
3. **Escape na exportação HTML+SVG:** `escapeHtml(str)` escapa `&`, `<`, `>`, `"` e `'` antes de gerar a string `.html` para download.
4. **Content Security Policy (CSP) recomendada:** incluir no `<head>` do `index.html`:
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self';">
   ```
5. **Limites de entrada:** título (`<= 120` chars), rótulo (`<= 80` chars), séries (`2..500` pontos) e upload `.csv` (`<= 512 KB`).
6. **`localStorage` (`dados_sonoros_v1_state`):** leitura/escrita em `try/catch`, validação de schema (`version === 1`, `rows` com rótulo string e `Number.isFinite(value)`), fallback transparente em memória com aviso não bloqueante (`role="status"`) e reset mediante confirmação explícita.

---

## 5. Acessibilidade (WCAG 2.2 AA) e SEO Básico

- **Semântica (`ACC-07`):** landmarks (`<header>`, `<main>`, `<section>`, `<footer>`), `<label>` em todo input, `<table>` com `<caption>` e `<th scope="col">`, região `aria-live="polite"` para navegação ponto a ponto e `role="alert"` para erros de CSV.
- **Teclado e Foco (`ACC-04`):** explorador do gráfico focável (`tabindex="0"`, `role="application"` ou região interativa rotulada com instruções de uso `←`/`→`, `Home`/`End`), `:focus-visible` `>= 3:1` e `scroll-margin-block: 24px`.
- **Alvos e Movimento (`ACC-05`, `ACC-06`):** controles `>= 24x24px` (`>= 44x44px` nos controles de áudio/navegação) e `@media (prefers-reduced-motion: reduce)` removendo animações/transições.
- **SEO (`SEO-01`..`SEO-04`):** `<html lang="pt-BR">`, `charset="UTF-8"`, `viewport`, `<title>`, `<meta name="description">`, único `<h1>`, favicon SVG inline (`data:image/svg+xml`) e metatags `og:title`, `og:description`, `og:type`.

---

## 6. Estratégia Executável de Testes Locais (Custo Zero)

Executável com **Node.js `v24.13.1`** nativo (`node --test` + `node:assert/strict`), **sem pacotes externos**:

```bash
node --test tests/*.test.js
# ou
npm test
npm run serve   # servidor estático local built-in (node:http) para QA manual
```

| Suíte | Casos Mínimos Obrigatórios | Critérios Cobertos |
| :--- | :--- | :--- |
| `tests/csv-parser.test.js` | Delimitadores `,`, `;` e `\t`; aspas; cabeçalho opcional; erro com linha exata para valor não numérico; `< 2` pontos; limite de 500 linhas. | `RF-01`, `RNF-03`, `CA-02` |
| `tests/stats.test.js` | `count`, `min`, `max`, `mean`, `median` (ímpar/par), `changeAbs`/`changePct` (incluindo primeiro valor `0`) e `trend`. | `RF-06`, `CA-01` |
| `tests/sonifier.test.js` | Mapeamento linear (`220–880 Hz`), logarítmico, fallback linear quando há `<= 0`, amplitude zero (`440 Hz`) e degradação graciosa sem `AudioContext`. | `RF-03`, `RNF-04`, `CA-03`, `CA-04`, `CA-06` |
| `tests/chart-model.test.js` | Modelo de barras e linhas, padrões distintos e `formatPointAnnouncement` (`←`/`→`, `Home`/`End`). | `RF-02`, `RF-04`, `ACC-02`, `CA-03` |
| `tests/storage.test.js` | Salvar/restaurar `dados_sonoros_v1_state`, JSON corrompido e fallback em memória sem exceção. | `RF-08`, `RNF-04` |
| `tests/exporter.test.js` | Pacote HTML+SVG autocontido (com `<script>` escapado contra XSS), JSON e CSV válidos. | `RF-07`, `CA-05` |
| `tests/dom-smoke.test.js` | Auditoria de `index.html` (SEO, OG, CSP, único `<h1>`, `aria-live="polite"`), CSS (`prefers-reduced-motion`, `:focus-visible`) e JS (zero `innerHTML`/`eval`, zero requisições externas). | `ACC-01`..`ACC-07`, `SEO-01`..`SEO-04`, `CA-07` |
