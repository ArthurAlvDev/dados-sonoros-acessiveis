# REQUIREMENTS — Dados Sonoros (`dados-sonoros-acessiveis`)

**Projeto:** `dados-sonoros-acessiveis`  
**Produto:** Dados Sonoros — Estúdio e Explorador Web No-Code de Gráficos Acessíveis, Sonificação de Dados e Tabelas Semânticas (`ACC-004`)  
**Tarefa:** `DSA-01`  
**Data:** 2026-11-17  
**Responsável:** Product Strategist (`product-strategist`)

---

## 1. Visão Geral, Problema e Público-Alvo

### 1.1 Problema
Gráficos, infográficos e painéis na web funcionam com frequência como "caixas-pretas" para pessoas cegas ou com baixa visão: leitores de tela anunciam apenas `"graphic"` repetidas vezes, sem permitir exploração autônoma de pontos, tendências ou comparações. Texto alternativo (`alt`) isolado é insuficiente para séries numéricas, e bibliotecas acessíveis existentes (`Chart2Music`, `Olli`, `Data Navigator`) exigem programação em JavaScript/TypeScript.

### 1.2 Público-Alvo
- **Primário:** Pessoas cegas e com baixa visão (estudantes, pesquisadores, profissionais e cidadãos consumindo dados públicos, notícias e material didático).
- **Secundário:** Professores, educadores, jornalistas de dados, ONGs e órgãos públicos que precisam publicar gráficos acessíveis sem programação.
- **Situacional/Universal:** Pessoas com sobrecarga visual ou que preferem revisão auditiva e tabular de séries numéricas.

### 1.3 Proposta de Valor
Aplicação web no-code, gratuita e executada **100% no navegador**, onde qualquer pessoa cola um CSV/tabela (ou escolhe um dataset de exemplo) para explorar dados via **sonificação determinística (Web Audio API)**, **navegação ponto a ponto por teclado**, **resumo estatístico determinístico**, **tabela semântica sincronizada** e **exportação de pacote HTML+SVG acessível**.

---

## 2. Escopo 100% Client-Side e Custo Zero

### 2.1 Incluído no MVP
- Aplicação web estática (HTML5 semântico + CSS3 + JavaScript/TypeScript vanilla ou build estático sem servidor).
- Importação/colagem de CSV/TSV, upload de arquivo `.csv` local, tabela editável simples e 3–4 datasets de exemplo em PT-BR.
- Gráfico SVG semântico (barras e linhas) com padrões visuais além da cor e alto contraste.
- Sonificação determinística local via **Web Audio API** (`AudioContext`, `OscillatorNode`, `GainNode`).
- Navegação por teclado ponto a ponto (`←`/`→`, `Home`/`End`) com anúncio estruturado em `aria-live`.
- Tabela de dados HTML semântica sincronizada com o gráfico.
- Resumo estatístico determinístico calculado localmente (mínimo, máximo, média, mediana, variação e tendência).
- Exportação local via `Blob` de pacote HTML+SVG acessível autocontido, JSON e CSV.

### 2.2 Fora de Escopo (Restrições Rígidas)
- **Zero backend e zero banco de dados externo.**
- **Zero APIs pagas ou chamadas a LLMs externos.**
- **Zero autenticação/cadastro e zero telemetria.**
- **Zero criação de repositório público pago ou recursos em nuvem com custo.**

---

## 3. Requisitos Funcionais

| ID | Requisito | Prioridade | Descrição |
| :--- | :--- | :---: | :--- |
| **RF-01** | Entrada de dados (CSV, upload, tabela editável e exemplos) | P0 | Permitir colar texto CSV/TSV (detectando vírgula, ponto e vírgula ou tabulação), importar arquivo `.csv` local, editar/adicionar/remover linhas em tabela editável simples e carregar com 1 clique ao menos 3 datasets de exemplo em PT-BR. |
| **RF-02** | Gráfico SVG semântico com ARIA | P0 | Renderizar gráfico SVG (tipos `Barras` e `Linhas`) com `role="img"` / estrutura acessível, `aria-labelledby`, `aria-describedby`, marcadores/padrões visuais distintos (não depender apenas de cor) e suporte a tema de alto contraste. |
| **RF-03** | Sonificação determinística via Web Audio API | P0 | Mapear valores numéricos para frequências sonoras (ex.: `220 Hz` a `880 Hz`) via `AudioContext`/`OscillatorNode`/`GainNode` com envelope suave; oferecer controles de **Reproduzir / Pausar / Parar**, ajuste de **velocidade** (ex.: `0.75x`, `1x`, `1.5x`, `2x`), seleção de **escala de frequência** (`Linear` ou `Logarítmica`) e **tom de referência** (mínimo/máximo). |
| **RF-04** | Navegação por teclado ponto a ponto com `aria-live` | P0 | Permitir navegar ponto a ponto no gráfico usando `←` / `→`, `Home` / `End` (além de botões Anterior/Próximo), destacando visualmente o ponto ativo, tocando seu som correspondente (quando áudio habilitado) e anunciando rótulo, valor e variação em região `aria-live="polite"`. |
| **RF-05** | Tabela de dados semântica sincronizada | P0 | Exibir tabela HTML nativa (`<table>`, `<caption>`, `<thead>`, `<th scope="col">`, `<tbody>`) sincronizada com o ponto selecionado no gráfico, permitindo também selecionar uma linha para focar/ouvir o ponto equivalente. |
| **RF-06** | Resumo estatístico determinístico | P0 | Calcular localmente sem IA: quantidade de pontos, **mínimo** (valor e rótulo), **máximo** (valor e rótulo), **média**, **mediana**, **variação do primeiro ao último ponto** (absoluta e %) e **tendência geral** (`crescente`, `decrescente` ou `estável`). |
| **RF-07** | Exportação local (HTML+SVG acessível, JSON, CSV) | P0 | Permitir baixar localmente via `Blob`: (1) pacote **HTML+SVG autocontido** contendo o gráfico SVG acessível, resumo estatístico e tabela semântica acoplada; (2) **JSON** estruturado (dados + estatísticas); e (3) **CSV** normalizado. |
| **RF-08** | Persistência local opcional | P1 | Salvar automaticamente em `localStorage` o último dataset editado e preferências de som/tema, com botão de reset mediante confirmação. |

---

## 4. Requisitos Não Funcionais

- **RNF-01 (100% Client-Side):** Todo parsing de CSV, cálculo estatístico, síntese sonora, renderização SVG e exportação ocorrem no navegador, sem chamadas de rede obrigatórias.
- **RNF-02 (Privacidade Estrita):** Nenhum dado inserido pelo usuário é enviado para servidores, APIs externas ou serviços de analytics.
- **RNF-03 (Desempenho):** Parsing, cálculo estatístico e renderização de séries de até 500 pontos em `< 150ms`.
- **RNF-04 (Resiliência de Áudio e Armazenamento):** Se a Web Audio API não estiver disponível ou estiver bloqueada, ou se `localStorage` falhar, a aplicação deve degradar graciosamente com aviso claro e manter exploração visual, tabular e por teclado 100% funcionais.
- **RNF-05 (Responsividade):** Layout utilizável de `320px` a `1440px+`, sem overflow horizontal.

---

## 5. Acessibilidade — WCAG 2.2 Nível AA

> **Regra de Governança e QA:** Este documento define requisitos alinhados à **WCAG 2.2 AA**, porém **não se deve declarar conformidade total com leitores de tela (NVDA, VoiceOver, JAWS) sem a execução de testes reais** com esses leitores de tela na fase de QA.

- **ACC-01 (Controle de Áudio — WCAG 1.4.2):** Nunca iniciar sonificação automaticamente ao carregar a página; o áudio só deve tocar após ação explícita do usuário (também exigido pela política de `AudioContext` dos navegadores).
- **ACC-02 (Não Depender Apenas de Cor — WCAG 1.4.1):** Barras, linhas e ponto selecionado devem combinar cor com padrões/hachuras SVG, marcadores geométricos distintos e rótulos textuais.
- **ACC-03 (Contraste — WCAG 1.4.3 / 1.4.11):** Mínimo `4.5:1` para textos normais e `3:1` para elementos gráficos, eixos, bordas e indicadores de foco; incluir modo `Alto Contraste`.
- **ACC-04 (Navegação por Teclado e Foco Visível — WCAG 2.1.1 / 2.4.7 / 2.4.11):** Operação completa por teclado (`Tab`, `Enter`/`Space`, `←`/`→`, `Home`/`End`) com `:focus-visible` nítido e sem obstrução por elementos fixos.
- **ACC-05 (Tamanho de Alvo — WCAG 2.5.8):** Controles interativos com alvo mínimo de `24x24px` CSS (recomendado `44x44px` nos controles principais de reprodução e navegação).
- **ACC-06 (`prefers-reduced-motion`):** Respeitar `@media (prefers-reduced-motion: reduce)`, removendo animações de barras/transições.
- **ACC-07 (Semântica e `aria-live`):** Landmarks HTML5, `<label>` em todos os campos e região `aria-live="polite"` dedicada ao anúncio ponto a ponto e mensagens de status.

---

## 6. SEO Básico

- **SEO-01:** `<html lang="pt-BR">`, `<meta charset="UTF-8">` e `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- **SEO-02:** `<title>` descritivo e `<meta name="description">` objetiva.
- **SEO-03:** Único `<h1>` na página e hierarquia semântica (`<h2>`, `<h3>`).
- **SEO-04:** Favicon estático/inline SVG e metatags Open Graph básicas (`og:title`, `og:description`, `og:type`).

---

## 7. Critérios de Aceite

- **CA-01:** Ao carregar um dos datasets de exemplo, o gráfico SVG, o resumo estatístico (mín, máx, média, mediana, tendência) e a tabela semântica são renderizados simultaneamente com valores consistentes.
- **CA-02:** Ao colar um CSV válido com delimitador `,` ou `;` (ou editar uma célula na tabela), o gráfico, as estatísticas e a tabela atualizam imediatamente.
- **CA-03:** Ao focar o explorador do gráfico e pressionar `→` / `←`, o ponto ativo muda, a região `aria-live` atualiza com rótulo/valor/variação e (com áudio habilitado) um tom proporcional ao valor é emitido via Web Audio API.
- **CA-04:** Ao acionar **Reproduzir**, a série é sonificada sequencialmente do início ao fim respeitando a velocidade e escala (`Linear`/`Logarítmica`) escolhidas, podendo ser pausada ou parada a qualquer momento.
- **CA-05:** Ao clicar em **Exportar HTML+SVG**, um arquivo `.html` autocontido é baixado contendo o SVG semântico, o resumo estatístico e a tabela de dados acessível.
- **CA-06:** Ao simular ausência ou falha de `AudioContext`, o sistema exibe aviso claro e mantém navegação por teclado, `aria-live`, gráfico, estatísticas, tabela e exportação funcionando sem erros.
- **CA-07:** Nenhuma requisição HTTP externa ocorre durante todo o fluxo (verificável na aba Network).
