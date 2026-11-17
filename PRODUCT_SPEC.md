# PRODUCT_SPEC — Dados Sonoros (`dados-sonoros-acessiveis`)

**Projeto:** `dados-sonoros-acessiveis`  
**Produto:** Dados Sonoros (`ACC-004`)  
**Tarefa:** `DSA-01`  
**Data:** 2026-11-17  
**Responsável:** Product Strategist (`product-strategist`)

---

## 1. Restrições Éticas, Privacidade e Governança

- **Processamento 100% Local:** Todos os dados colados, arquivos CSV importados, cálculos estatísticos, áudio gerado e exportações acontecem exclusivamente na memória do navegador.
- **Zero Telemetria:** Nenhum script de analytics, rastreamento de cliques ou envio de dados para terceiros.
- **Transparência sobre Conformidade WCAG:** A interface implementa boas práticas estruturais de **WCAG 2.2 AA** (semântica, teclado, contraste, `aria-live`, `prefers-reduced-motion`), mas **não declara conformidade certificada com leitores de tela** até que testes reais com NVDA, VoiceOver ou JAWS sejam executados e aprovados em QA.
- **Custo Zero:** Zero backend, zero banco de dados externo, zero API paga e zero LLM externo.

---

## 2. Fluxos de Uso

### Fluxo 1: Entrada de Dados (Exemplo, CSV ou Edição Direta)
1. O usuário acessa a aplicação e pode escolher imediatamente um **Dataset de Exemplo** (ex.: *Temperatura Média Mensal*, *Acessos por Trimestre*, *Orçamento Escolar*) ou colar seu próprio CSV/TSV (ou selecionar um arquivo `.csv` local).
2. O usuário também pode editar rótulos e valores diretamente na **Tabela Editável** (ou adicionar/remover linhas) para ajustes rápidos sem precisar editar texto bruto.
3. Ao confirmar ou editar, o sistema valida os dados e atualiza simultaneamente o **Resumo Estatístico**, o **Gráfico SVG**, o **Explorador por Teclado/Áudio** e a **Tabela Semântica**.

### Fluxo 2: Exploração Auditiva e por Teclado
1. O usuário ajusta (se desejar) o tipo de gráfico (`Barras` ou `Linhas`), tema (`Padrão` ou `Alto Contraste`), escala sonora (`Linear` ou `Logarítmica`) e velocidade (`0.75x`, `1x`, `1.5x`, `2x`).
2. Ao clicar em **Reproduzir Série** (ou pressionar o botão correspondente), a Web Audio API toca sequencialmente cada ponto da série, destacando o ponto atual no gráfico e na tabela.
3. Para exploração autônoma ponto a ponto, o usuário foca a área interativa do gráfico e usa `←` / `→` (ou `Home` / `End`) ou os botões **Ponto Anterior** / **Próximo Ponto**:
   - O ponto ativo recebe destaque visual (borda/marcador reforçado).
   - A região `aria-live="polite"` anuncia, por exemplo: `"Ponto 3 de 6: Março, valor 42. Variação de +12 em relação a Fevereiro."`
   - Um tom curto (ex.: `180ms`) com frequência proporcional ao valor é reproduzido (se o áudio estiver habilitado).

### Fluxo 3: Exportação do Pacote Acessível
1. O usuário clica em **Exportar HTML+SVG Acessível**, **Exportar JSON** ou **Exportar CSV**.
2. O sistema gera o arquivo localmente via `Blob` e inicia o download imediato:
   - O arquivo `.html` exportado é autocontido (CSS inline de alto contraste, SVG com `<title>`/`<desc>` e padrões visuais, resumo estatístico em texto e `<table>` semântica completa logo abaixo do gráfico).

---

## 3. Estrutura da Interface

```text
+-----------------------------------------------------------------------+
| HEADER                                                                |
| Dados Sonoros — Gráficos Acessíveis, Sonificação e Tabelas Semânticas |
| Tema: [Padrão | Alto Contraste]   [Carregar Exemplo v]                |
+-----------------------------------------------------------------------+
| 1. ENTRADA DE DADOS                                                   |
| Título do gráfico: [________________________________]                 |
| [Colar CSV/TSV]  [Importar arquivo .csv]  [Limpar dados]              |
| (Tabela editável rápida: Rótulo | Valor | [+ Adicionar linha])        |
+-----------------------------------------------------------------------+
| 2. RESUMO ESTATÍSTICO DETERMINÍSTICO                                  |
| Pontos: 6 | Mín: 12 (Jan) | Máx: 48 (Jun) | Média: 29,5 | Mediana: 28 |
| Variação: +300% | Tendência: Crescente                                |
+-----------------------------------------------------------------------+
| 3. CONTROLES DE GRÁFICO E SONIFICAÇÃO                                 |
| Tipo: [Barras | Linhas]  Escala: [Linear | Log]  Vel.: [1x v]         |
| [Reproduzir] [Pausar] [Parar] [Tom Mín/Máx] | [Anterior] [Próximo]    |
+-----------------------------------------------------------------------+
| 4. GRÁFICO SVG ACESSÍVEL & EXPLORADOR                                 |
| [Área SVG com padrões/texturas além da cor + foco no ponto ativo]     |
| Região aria-live: "Ponto 3 de 6: Março — 42 (+40% vs. anterior)"      |
+-----------------------------------------------------------------------+
| 5. TABELA SEMÂNTICA SINCRONIZADA                                      |
| <table> com caption, headers scope="col" e linha ativa destacada      |
+-----------------------------------------------------------------------+
| 6. EXPORTAÇÃO LOCAL                                                   |
| [Exportar HTML+SVG Acessível]  [Exportar JSON]  [Exportar CSV]        |
+-----------------------------------------------------------------------+
| FOOTER                                                                |
| 100% local no navegador • Zero telemetria • Zero servidor/IA paga     |
+-----------------------------------------------------------------------+
```

---

## 4. Especificação de Sonificação Determinística (Web Audio API)

- **Faixa de frequência padrão:** `220 Hz` (valor mínimo) até `880 Hz` (valor máximo) — faixa confortável para audição humana e alto-falantes de notebooks/celulares.
- **Mapeamento Linear:**  
  `freq = minFreq + ((valor - minVal) / (maxVal - minVal)) * (maxFreq - minFreq)`  
  *(Se `maxVal === minVal`, usar frequência central `440 Hz`).*
- **Mapeamento Logarítmico:** aplicável quando todos os valores são `> 0`, usando `Math.log10` normalizado para destacar variações proporcionais em séries com grande amplitude.
- **Envelope sonoro (`GainNode`):** rampa rápida de ataque (`15ms`) e decaimento suave (`40ms`) para evitar estalos ("clicks") no alto-falante.
- **Forma de onda:** `triangle` ou `sine` (timbre suave que evita fadiga auditiva).

---

## 5. Estados de Erro, Vazio e Fallback (Web Audio API)

| Cenário | Comportamento Esperado |
| :--- | :--- |
| **Entrada vazia** | Exibir estado inicial orientador com botões de 1 clique para carregar os datasets de exemplo; ocultar/desabilitar exportação e reprodução com mensagem clara. |
| **CSV inválido ou < 2 pontos numéricos** | Exibir mensagem de erro acessível (`role="alert"`) indicando a linha ou coluna com valor não numérico, sem apagar o texto colado para que o usuário possa corrigir. |
| **Valores iguais (amplitude zero)** | Renderizar gráfico e estatísticas normalmente; na sonificação, emitir frequência fixa (`440 Hz`) e anunciar no `aria-live` que os valores são constantes. |
| **Web Audio API indisponível ou bloqueada** | Exibir aviso claro em `aria-live` (*"Áudio da Web Audio API indisponível neste navegador. A exploração por teclado, leitor de tela, gráfico SVG e tabela continuam 100% disponíveis."*). Desabilitar apenas os botões de reprodução sonora, mantendo todo o restante operacional. |
| **`localStorage` indisponível/corrompido** | Operar em memória normalmente e avisar de forma não bloqueante que alterações não ficarão salvas após fechar a aba. |

---

## 6. Persistência Local (`localStorage`)

- **Chave:** `dados_sonoros_v1_state`
```json
{
  "version": 1,
  "title": "Temperatura Média Mensal",
  "chartType": "line",
  "theme": "default",
  "audioScale": "linear",
  "playbackRate": 1,
  "rows": [
    { "label": "Jan", "value": 24 },
    { "label": "Fev", "value": 26 }
  ]
}
```
