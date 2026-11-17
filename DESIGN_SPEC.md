# DESIGN_SPEC — Dados Sonoros (`dados-sonoros-acessiveis`)

**Projeto:** `dados-sonoros-acessiveis`  
**Produto:** Dados Sonoros — Estúdio e Explorador Web No-Code de Gráficos Acessíveis, Sonificação de Dados e Tabelas Semânticas (`ACC-004`)  
**Tarefa:** `DSA-02B`  
**Data:** 2026-11-17  
**Responsável:** UI/UX Designer (`ui-ux-designer`)  
**Entradas:** [REQUIREMENTS.md](file:///C:/Users/Chief/OpenBot/Shared/AI-STARTUP-FACTORY/projects/dados-sonoros-acessiveis/REQUIREMENTS.md), [PRODUCT_SPEC.md](file:///C:/Users/Chief/OpenBot/Shared/AI-STARTUP-FACTORY/projects/dados-sonoros-acessiveis/PRODUCT_SPEC.md)

---

## 1. Identidade Visual e Princípios de Acessibilidade (WCAG 2.2 AA)

O **Dados Sonoros** adota uma estética de **estúdio editorial analítico de alta legibilidade**: superfícies limpas, tipografia nativa sem serifa com números tabulares (`font-variant-numeric: tabular-nums`), hierarquia visual clara entre entrada, resumo, controles de sonificação, gráfico SVG e tabela semântica.

- **Zero dependências externas/pagas:** Sem fontes externas (Google Fonts), sem CDNs de ícones e sem bibliotecas pagas. Ícones de UI são SVG inline (`aria-hidden="true"`) sempre acompanhados de rótulo textual ou `aria-label` claro.
- **Nunca depender apenas de cor (WCAG 1.4.1):** Séries, barras, linhas e ponto selecionado combinam cor, hachuras SVG (`<pattern>`), marcadores geométricos distintos e rótulos numéricos.
- **Controle explícito de áudio (WCAG 1.4.2):** Nenhuma sonificação inicia automaticamente ao carregar a página.
- **Transparência de conformidade:** A interface implementa padrões estruturais da **WCAG 2.2 Nível AA**, mas **não declara conformidade certificada com leitores de tela** (NVDA, VoiceOver, JAWS) antes da validação prática na fase de QA.

---

## 2. Design Tokens CSS — Temas `Claro` e `Alto Contraste`

Os tokens são definidos em `:root` (`default` / `[data-theme="claro"]`) e sobrescritos via `[data-theme="alto-contraste"]` no elemento `<html>`.

### 2.1 CSS Custom Properties (`tokens.css`)

```css
:root,
[data-theme="claro"] {
  /* Superfícies */
  --bg-page: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-muted: #EDF2F7;
  --bg-active-row: #E2EFF8;

  /* Texto */
  --text-primary: #0F172A;
  --text-secondary: #334155;
  --text-muted: #475569;

  /* Ação e Foco */
  --accent: #0E5A8A;
  --accent-hover: #0A4368;
  --accent-contrast: #FFFFFF;
  --focus-ring: #00449E;

  /* Bordas */
  --border-subtle: #CBD5E1;
  --border-strong: #64748B;

  /* Gráfico SVG */
  --chart-series-1: #0E5A8A;
  --chart-series-2: #9A3412;
  --chart-active: #B45309;
  --chart-grid: #CBD5E1;
  --chart-axis: #334155;

  /* Status */
  --status-ok-bg: #ECFDF5;
  --status-ok-text: #065F46;
  --status-ok-border: #059669;

  --status-warn-bg: #FFFBEB;
  --status-warn-text: #78350F;
  --status-warn-border: #D97706;

  --status-error-bg: #FEF2F2;
  --status-error-text: #991B1B;
  --status-error-border: #DC2626;
}

[data-theme="alto-contraste"] {
  --bg-page: #000000;
  --bg-surface: #0A0A0A;
  --bg-muted: #1A1A1A;
  --bg-active-row: #002B49;

  --text-primary: #FFFFFF;
  --text-secondary: #F1F5F9;
  --text-muted: #E2E8F0;

  --accent: #FFE600;
  --accent-hover: #FFF04D;
  --accent-contrast: #000000;
  --focus-ring: #FFE600;

  --border-subtle: #94A3B8;
  --border-strong: #FFFFFF;

  --chart-series-1: #66D9FF;
  --chart-series-2: #FF99CC;
  --chart-active: #FFE600;
  --chart-grid: #94A3B8;
  --chart-axis: #FFFFFF;

  --status-ok-bg: #002611;
  --status-ok-text: #80FFB3;
  --status-ok-border: #80FFB3;

  --status-warn-bg: #2B1F00;
  --status-warn-text: #FFE600;
  --status-warn-border: #FFE600;

  --status-error-bg: #330000;
  --status-error-text: #FF9999;
  --status-error-border: #FF9999;
}
```

### 2.2 Matriz de Contraste Validada (WCAG 2.2)

| Par (Primeiro plano / Fundo) | Tema Claro | Alto Contraste (AAA >= 7:1) | Requisito |
| :--- | :---: | :---: | :---: |
| `--text-primary` / `--bg-page` | `17.06:1` | `21.00:1` | >= 4.5:1 |
| `--text-primary` / `--bg-surface` | `17.85:1` | `19.80:1` | >= 4.5:1 |
| `--text-primary` / `--bg-active-row` | `15.25:1` | `14.57:1` | >= 4.5:1 |
| `--text-secondary` / `--bg-page` | `9.90:1` | `19.17:1` | >= 4.5:1 |
| `--text-muted` / `--bg-muted` | `6.73:1` | `14.12:1` | >= 4.5:1 |
| `--accent` / `--bg-page` | `7.05:1` | `16.57:1` | >= 4.5:1 |
| `--accent-contrast` / `--accent` | `7.37:1` | `16.57:1` | >= 4.5:1 |
| `--border-strong` / `--bg-surface` | `4.76:1` | `19.80:1` | >= 3.0:1 |
| `--focus-ring` / `--bg-page` | `8.65:1` | `16.57:1` | >= 3.0:1 |
| `--chart-series-1` / `--bg-surface` | `7.37:1` | `12.19:1` | >= 3.0:1 |
| `--chart-series-2` / `--bg-surface` | `7.31:1` | `10.07:1` | >= 3.0:1 |
| `--chart-active` / `--bg-surface` | `5.02:1` | `15.62:1` | >= 3.0:1 |
| `--chart-axis` / `--bg-surface` | `10.35:1` | `19.80:1` | >= 3.0:1 |
| `--status-ok-text` / `--status-ok-bg` | `7.29:1` | `13.13:1` | >= 4.5:1 |
| `--status-warn-text` / `--status-warn-bg` | `8.75:1` | `12.76:1` | >= 4.5:1 |
| `--status-error-text` / `--status-error-bg` | `7.60:1` | `9.00:1` | >= 4.5:1 |

---

## 3. Tipografia, Escala e Layout

- **Pilha tipográfica (100% local):**
  - `--font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Liberation Sans", Arial, sans-serif;`
  - `--font-mono: ui-monospace, "Cascadia Mono", "Segoe UI Mono", "Liberation Mono", monospace;` (para entrada CSV/TSV e valores numéricos alinhados).
- **Números tabulares:** Aplicar `font-variant-numeric: tabular-nums;` no resumo estatístico, eixos do gráfico e células numéricas da tabela.
- **Container:** `max-width: 1120px; margin-inline: auto; padding-inline: 16px;` (mobile) até `32px` (desktop).

---

## 4. Gráfico SVG Semântico, Padrões Visuais e Navegação Ponto a Ponto

### 4.1 Padrões Visuais Além da Cor (WCAG 1.4.1)
Para garantir distinção sem depender de percepção cromática:
- **Gráfico de Barras:**
  - Série principal usa preenchimento sólido `--chart-series-1` combinado com `<pattern id="pattern-diagonal">` (linhas diagonais sutis em `stroke="var(--bg-surface)" stroke-opacity="0.35"`).
  - Se houver segunda série ou comparação, usar `<pattern id="pattern-dots">` com `--chart-series-2`.
  - **Barra ativa (selecionada):** borda externa dupla (`stroke: var(--chart-active); stroke-width: 3px;`), preenchimento contrastado e marcador superior (losango ou seta `▼`) + rótulo numérico visível acima da barra.
- **Gráfico de Linhas:**
  - Linha principal: `stroke: var(--chart-series-1); stroke-width: 3px;` + marcadores geométricos em todos os pontos (`<circle r="5">` na série 1; `<rect>` quadrado ou `<polygon>` triângulo caso haja outra série; `stroke-dasharray="6 4"` para séries secundárias).
  - **Ponto ativo:** círculo ampliado (`r="8"`) em `--chart-active` com anel externo branco/contraste (`stroke: var(--bg-surface); stroke-width: 2.5px;`) e anel de foco (`stroke: var(--focus-ring)`), além de linha guia vertical pontilhada até o eixo X e tooltip fixo/rótulo de valor sem sobrepor o ponto.

### 4.2 Semântica SVG e Navegação por Teclado Ponto a Ponto
- **Estrutura do SVG:**
  - `<svg role="img" aria-labelledby="chart-title" aria-describedby="chart-desc">` com `<title id="chart-title">` e `<desc id="chart-desc">` contendo o resumo da série.
  - Wrapper ou grupo explorável (`tabindex="0"`, `role="application"` ou `role="region"` com instruções visíveis de teclado: *"Use as setas Esquerda e Direita, Home ou End para navegar pelos pontos"*).
- **Teclas suportadas:**
  - `ArrowRight`: avança para o próximo ponto.
  - `ArrowLeft`: volta para o ponto anterior.
  - `Home`: vai para o primeiro ponto.
  - `End`: vai para o último ponto.
  - `Enter` / `Space` (nos botões ou no ponto): reproduz o tom sonoro do ponto atual (quando Web Audio disponível).
- **Foco Visível e `2.4.11 Focus Not Obscured`:**
  ```css
  :focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 2px;
  }

  button,
  input,
  select,
  textarea,
  [tabindex] {
    scroll-margin-top: 5rem;
    scroll-margin-bottom: 3rem;
  }
  ```
- **Região `aria-live="polite"` Sincronizada:**
  - Posicionada logo abaixo do gráfico SVG (visível também para usuários de baixa visão como barra de status do ponto atual).
  - Formato padrão do anúncio: `"Ponto {i} de {N}: {rótulo}, valor {valor}. Variação de {delta} em relação ao ponto anterior."`
  - Sincronização bidirecional: navegar no gráfico destaca a linha correspondente na tabela (`aria-current="true"` e fundo `--bg-active-row`); clicar/ativar uma linha da tabela move o foco ativo do gráfico para aquele ponto e dispara o anúncio e o tom curto.

---

## 5. Controles de Sonificação e Tamanho de Alvo (`2.5.8`)

### 5.1 Controles Obrigatórios
- **Reprodução:** `Reproduzir`, `Pausar`, `Parar` e `Tom Mín/Máx` (para calibrar referência auditiva antes de ouvir a série).
- **Navegação manual:** `Ponto Anterior` (`←`) e `Próximo Ponto` (`→`).
- **Parâmetros sonoros:**
  - **Velocidade:** `<select>` ou grupo de botões (`0.75x`, `1x`, `1.5x`, `2x`).
  - **Escala de frequência:** `Linear` | `Logarítmica` (com nota explicativa quando houver valores `<= 0` impedindo escala logarítmica).
  - **Volume:** `<input type="range" min="0" max="100">` com `<label>` explícito e valor percentual visível (`70%`).

### 5.2 Tamanho Mínimo de Alvo (WCAG 2.2 `2.5.8`)
- **Controles principais (`44x44px`):** botões de Reproduzir, Pausar, Parar, Anterior, Próximo, alternadores de Tema/Tipo de Gráfico/Escala e botões de Exportação:
  ```css
  .btn-primary,
  .btn-control,
  .segmented-btn {
    min-height: 44px;
    min-width: 44px;
    padding: 8px 16px;
  }
  ```
- **Demais controles (`>= 24x24px`):** inputs compactos de tabela editável e botões secundários de remover linha têm `min-width: 24px; min-height: 24px;` (recomendado `36px`–`44px` com `gap: 8px` entre alvos adjacentes).

---

## 6. Tabela Semântica Sincronizada

- Estrutura nativa obrigatória:
  ```html
  <table>
    <caption>Dados da série: {título do gráfico}</caption>
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Rótulo</th>
        <th scope="col">Valor</th>
        <th scope="col">Variação</th>
      </tr>
    </thead>
    <tbody>
      <!-- Linha ativa recebe class="is-active" e aria-current="true" -->
    </tbody>
  </table>
  ```
- Em telas estreitas (`< 640px`), envolver a tabela em container com `overflow-x: auto;` e `tabindex="0"` com `aria-label="Tabela de dados rolável"`, evitando quebra da página inteira.

---

## 7. Estados Vazio, Erro e Fallback (Web Audio API)

| Cenário | Tratamento Visual e Acessível |
| :--- | :--- |
| **Entrada vazia** | Cartão orientador em `--bg-surface` com borda tracejada `--border-strong` e botões de 1 clique para os 3 datasets de exemplo em PT-BR. Botões de exportação e reprodução ficam desabilitados (`disabled`) com texto explicativo. |
| **CSV inválido ou < 2 pontos** | Alerta visível em `--status-error-bg` / `--status-error-text` com `role="alert"` indicando exatamente a linha/coluna problemática, preservando o texto colado no `<textarea>` para correção. |
| **Valores iguais (amplitude zero)** | Gráfico e tabela renderizam normalmente; nota informativa em `--status-warn-bg` e anúncio `aria-live` explicando que todos os valores são iguais (som fixo em `440 Hz`). |
| **Web Audio API indisponível ou bloqueada** | Banner visível e `aria-live="polite"` em `--status-warn-bg` / `--status-warn-text`: *"Áudio da Web Audio API indisponível neste navegador. A exploração por teclado, leitor de tela, gráfico SVG e tabela continuam 100% disponíveis."* Desabilitar apenas os botões de reprodução sonora, mantendo 100% funcional o restante da interface. |
| **`localStorage` indisponível** | Aviso discreto não bloqueante informando operação apenas em memória nesta aba. |

---

## 8. Responsividade (`320px`–`1440px+`) e `prefers-reduced-motion`

- **Responsividade:**
  - `320px`–`639px` (Mobile): controles empilhados com `flex-wrap: wrap; gap: 8px;`, resumo estatístico em grade `2 colunas`, gráfico SVG com `width: 100%; height: auto; viewBox` responsivo, sem rolagem horizontal na página.
  - `640px`–`1023px` (Tablet): resumo estatístico em `3 colunas`, controles de áudio em barra flexível.
  - `1024px`–`1440px+` (Desktop): layout em container `1120px`, resumo estatístico em linha única (`6 cards`), controles de áudio e gráfico alinhados.
- **`prefers-reduced-motion: reduce` (ACC-06):**
  ```css
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto !important;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  Qualquer transição de destaque de barra, ponto ativo ou rolagem automática da tabela durante a sonificação deve verificar `prefers-reduced-motion: reduce` e atualizar de forma instantânea sem animação.
