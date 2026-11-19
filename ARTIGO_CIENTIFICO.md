# Dados Sonoros: Estúdio e Explorador Web No-Code para Gráficos Acessíveis, Sonificação Determinística e Tabelas Semânticas

**Dados Sonoros: A No-Code Web Studio and Explorer for Accessible Charts, Deterministic Sonification, and Semantic Tables**

**Arthur Alves Ferreira (Ferreira, A. A.)**
OlacDev · <https://olacdev.com/>

**Versão:** 1.0 · **Data:** 19/11/2026
**Licença do texto:** CC BY 4.0 · **Licença do software:** MIT
**Tipo de recurso (Zenodo):** Preprint · **Idioma:** Português (Brasil)

*Pré-print interno. Ainda não depositado em repositório de dados; ao publicar, substituir esta nota pelo DOI. A versão citável do software é o repositório público indicado nas referências.*

---

## Resumo

Gráficos, infográficos e painéis de dados na web frequentemente operam como barreiras intransponíveis ("caixas-pretas") para pessoas cegas ou com baixa visão, uma vez que leitores de tela costumam anunciá-los apenas como elementos gráficos genéricos sem permitir a exploração autônoma de pontos, tendências ou comparações. Embora existam bibliotecas open-source relevantes para sonificação e navegação em gráficos, como *Chart2Music*, *Olli* e *Data Navigator*, seu uso exige conhecimentos de programação em JavaScript/TypeScript, criando uma lacuna (*no-code gap*) para educadores, jornalistas, organizações sem fins lucrativos e estudantes com deficiência visual. Este artigo apresenta o **Dados Sonoros** (`dados-sonoros-acessiveis`), uma aplicação web estática de página única (*Single-Page Application* sem framework), executada 100% no navegador com custo zero, zero telemetria e privacidade local. O aplicativo permite importar ou colar dados CSV/TSV (ou editar tabelas diretamente), gerar gráficos SVG semânticos com padrões visuais além da cor (temas Claro e Alto Contraste AAA), calcular resumos estatísticos determinísticos, explorar séries ponto a ponto via teclado (`←`/`→`/`Home`/`End`) com anúncios `aria-live="polite"` sincronizados à tabela semântica, sonificar valores numéricos por meio da **Web Audio API** (mapeamento linear e logarítmico entre `220 Hz` e `880 Hz` com degradação graciosa) e exportar pacotes HTML+SVG autocontidos, JSON e CSV. Na avaliação técnica, a suíte de testes automatizados (`node --test`) obteve **14/14 testes aprovados** (0 falhas) e a auditoria estática de segurança recebeu parecer **APROVADO** (0 achados críticos, altos ou médios; 1 achado baixo de neutralização de fórmulas em reexportação CSV e 2 observações informativas). Em produção na Vercel (`https://dados-sonoros-acessiveis.vercel.app`), a verificação de saúde confirmou disponibilidade HTTP 200 em todos os endpoints e recursos estáticos, registrando 7 avisos não bloqueantes de CSP referentes a estilos inline em runtime. Como limitação transparente, não foram realizados testes com leitores de tela reais (NVDA, VoiceOver, JAWS) nem verificação física de saída de áudio neste ciclo, razão pela qual não se declara conformidade certificada com leitores de tela sem essa validação empírica.

**Palavras-chave:** Sonificação de dados; Acessibilidade de dados; Pessoas cegas e baixa visão; Web Audio API; SVG semântico; Tecnologia no-code.

---

## Abstract

Charts, infographics, and data dashboards on the web often act as impenetrable "black boxes" for blind and low-vision people, as screen readers frequently announce them merely as generic graphics without enabling autonomous exploration of data points, trends, or comparisons. Although relevant open-source libraries exist for chart sonification and navigation—such as *Chart2Music*, *Olli*, and *Data Navigator*—their use requires JavaScript/TypeScript programming skills, creating a no-code gap for educators, journalists, NGOs, and visually impaired students. This paper presents **Dados Sonoros** (`dados-sonoros-acessiveis`), a framework-free static Single-Page Application executed 100% in the browser with zero cost, zero telemetry, and local privacy. The application allows users to import or paste CSV/TSV data (or edit tables directly), generate semantic SVG charts with visual patterns beyond color (Light and High Contrast AAA themes), compute deterministic statistical summaries, explore series point-by-point via keyboard (`←`/`→`/`Home`/`End`) with `aria-live="polite"` announcements synchronized with a semantic table, sonify numeric values through the **Web Audio API** (linear and logarithmic mapping between `220 Hz` and `880 Hz` with graceful degradation), and export self-contained accessible HTML+SVG packages, JSON, and CSV. In technical evaluation, the automated test suite (`node --test`) achieved **14/14 passing tests** (0 failures), and the static security audit was **APPROVED** (0 critical, high, or medium findings; 1 low finding regarding CSV formula neutralization on re-export, and 2 informational notes). Deployed on Vercel (`https://dados-sonoros-acessiveis.vercel.app`), health monitoring confirmed HTTP 200 availability across all endpoints and static assets, logging 7 non-blocking CSP warnings related to runtime inline styles. As a transparent limitation, real screen-reader testing (NVDA, VoiceOver, JAWS) and physical audio output verification were not conducted in this cycle; therefore, certified screen-reader compliance is not claimed without empirical validation.

**Keywords:** Data sonification; Data accessibility; Blind and low-vision users; Web Audio API; Semantic SVG; No-code technology.

---

## 1. Introdução e Definição do Problema

A visualização de dados é um instrumento central na educação, no jornalismo, na ciência e na transparência de políticas públicas. Contudo, gráficos publicados na web e em documentos digitais frequentemente excluem pessoas cegas ou com baixa visão. Relatos recorrentes em comunidades como `r/Blind` e `r/accessibility` descrevem a frustração de estudantes e profissionais que, ao navegar por artigos científicos ou painéis institucionais com leitores de tela (como NVDA), ouvem apenas o anúncio repetitivo de *"graphic"* sem acesso aos valores, tendências ou comparações entre pontos.

Mesmo quando autores adicionam texto alternativo (`alt`), uma única frase resumida é insuficiente para visualizações com múltiplos pontos ou séries numéricas, pois não permite exploração autônoma nem verificação independente dos dados. Estudos de co-design conduzidos por pesquisadores do MIT e da Microsoft Research (como o projeto *Chart Reader*) demonstram que a autonomia na análise de dados por usuários de leitores de tela exige a combinação de três pilares: narrativa estruturada (resumo estatístico), exploração ponto a ponto por teclado e acesso à tabela de dados subjacente.

Embora existam bibliotecas open-source especializadas (`Chart2Music`, `Olli`, `Data Navigator`) e módulos comerciais (`Highcharts Accessibility Module`), persiste uma lacuna prática: **todas as bibliotecas gratuitas exigem programação** em JavaScript ou TypeScript, enquanto soluções empresariais apresentam custos de licenciamento incompatíveis com uso educacional gratuito ou comunitário. Um professor, uma ONG ou um estudante cego em língua portuguesa não dispõe facilmente de uma ferramenta web gratuita e sem código (*no-code*) para colar uma tabela CSV e, imediatamente, ouvir a curva de dados, navegar ponto a ponto por teclado e exportar um gráfico acessível pronto para publicação.

Este artigo apresenta o **Dados Sonoros** (`dados-sonoros-acessiveis`), detalhando sua arquitetura 100% local, seus mecanismos de sonificação e navegação semântica, seu impacto social potencial e os resultados de sua avaliação técnica em qualidade, segurança e disponibilidade em produção.

---

## 2. Fundamentação Teórica e Trabalhos Relacionados

### 2.1 Acessibilidade em Visualização de Dados e Sonificação

De acordo com as diretrizes **WCAG 2.2 Nível AA**, todo conteúdo não textual relevante deve possuir alternativa textual equivalente (Critério 1.1.1), a informação não deve depender exclusivamente da cor para ser compreendida (Critério 1.4.1 — *Use of Color*) e todas as funcionalidades devem ser operáveis por teclado (Critério 2.1.1) com foco visível. Na literatura de tecnologia assistiva, a **sonificação de dados** — mapeamento sistemático de valores numéricos para parâmetros acústicos como frequência (altura tonal) — atua como canal perceptual complementar à leitura tátil ou falada, permitindo apreender rapidamente tendências, picos, vales e variações proporcionais em séries numéricas.

### 2.2 Soluções Existentes e Lacuna No-Code

A Tabela 1 compara o **Dados Sonoros** com ferramentas e bibliotecas representativas identificadas no levantamento de referências.

| Característica | Dados Sonoros | Chart2Music | Olli / Data Navigator | Chart Reader (Microsoft) | Highcharts Accessibility |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Interface web No-Code (colar CSV/tabela) | ✓ | — | — | Parcial | — |
| Custo zero sem licença comercial | ✓ | ✓ | ✓ | ✓ | — |
| Sonificação nativa no navegador | ✓ | ✓ | — | — | ✓ |
| Navegação ponto a ponto + `aria-live` | ✓ | ✓ | ✓ | ✓ | ✓ |
| Resumo estatístico determinístico local | ✓ | — | — | ✓ | — |
| Exportação de pacote HTML+SVG acessível | ✓ | — | — | — | — |
| Interface nativa em Português (PT-BR) | ✓ | — | — | — | Configurável |

Enquanto **Chart2Music** (licença MIT) e **Olli / Data Navigator** fornecem excelente infraestrutura para desenvolvedores integrarem acessibilidade em gráficos programados, o **Dados Sonoros** preenche a lacuna de uso direto sem código, reunindo entrada tabular imediata, sonificação determinística, tabela semântica sincronizada e exportação autocontida em português.

---

## 3. Arquitetura e Funcionamento Detalhado do Aplicativo

### 3.1 Visão Geral da Arquitetura

O **Dados Sonoros** é uma *Single-Page Application* estática construída com **HTML5 semântico**, **CSS3** (`tokens.css` e `main.css`) e **JavaScript Vanilla** em módulos **UMD leves** (`0` dependências externas, `0` backend e `0` telemetria). Os módulos são carregados via `<script defer>` no navegador (sob `globalThis.DadosSonoros`) e testados nativamente no Node.js via `node --test`:

- `src/js/datasets.js`: três conjuntos de dados de exemplo em português (*Temperatura Média Mensal*, *Acessos por Trimestre* e *Orçamento Escolar*) para uso imediato sem necessidade de arquivo externo.
- `src/js/csv-parser.js`: parser e validador local de CSV/TSV com detecção automática de delimitador (`,`, `;`, `\t`), suporte a aspas duplas, cabeçalho opcional, separador decimal `.` ou `,` e limites defensivos (máximo de **500 linhas** de dados e **512 KB** em upload de arquivo `.csv`).
- `src/js/stats.js`: cálculo estatístico determinístico (`count`, `min`, `max`, `mean`, `median`, `changeAbs`, `changePct` e `trend` classificada em `crescente`, `decrescente` ou `estável` segundo limiar de ±2%).
- `src/js/sonifier.js`: mapeamento de frequências e engine de áudio via **Web Audio API**.
- `src/js/chart-model.js`: construção pura do modelo geométrico SVG (`viewBox` `720×360`), padrões visuais `<pattern>` e formatação dos anúncios para `aria-live`.
- `src/js/storage.js`: persistência local na chave `dados_sonoros_v1_state` com validação de esquema e fallback em memória.
- `src/js/exporter.js`: geração e download local de pacote HTML+SVG acessível autocontido, JSON e CSV via `Blob`.
- `src/js/app.js`: orquestração da interface, tabela editável em tempo real, controle de teclado e regiões vivas (`aria-live`).

### 3.2 Como Funciona a Sonificação Determinística (`sonifier.js`)

A conversão de números em som utiliza exclusivamente a **Web Audio API** nativa (`AudioContext`, `OscillatorNode` e `GainNode`), sendo instanciada apenas após interação explícita do usuário (clique ou tecla), evitando reprodução automática intrusiva:

1. **Faixa de Frequência:** Os valores são mapeados entre **`220 Hz`** (valor mínimo) e **`880 Hz`** (valor máximo), faixa confortável para audição humana e alto-falantes convencionais. Quando todos os valores da série são idênticos (`maxVal === minVal`), utiliza-se frequência central fixa de **`440 Hz`**.
2. **Escala Linear e Logarítmica:**
   - Na escala **linear** (padrão): `freq = 220 + ((valor - minVal) / (maxVal - minVal)) * (880 - 220)`.
   - Na escala **logarítmica**: normaliza `Math.log10(value)` quando `minVal > 0` e `value > 0`, destacando variações proporcionais em séries de grande amplitude; caso haja valores `<= 0`, executa *fallback* determinístico para escala linear (`usedFallbackLinear: true`).
3. **Envelope Acústico Suave:** Para evitar estalos (*clicks*) no alto-falante, o `GainNode` aplica rampa de ataque de **`15 ms`** e decaimento suave de **`40 ms`** sobre forma de onda triangular (`triangle`), com controle de velocidade (`0.75x`, `1x`, `1.5x`, `2x`), volume, reprodução contínua da série, pausa, parada e tons de referência mínima/máxima.
4. **Degradação Graciosa:** Caso `AudioContext` esteja indisponível ou bloqueado pelo navegador, a engine retorna estado controlado e exibe aviso acessível (`#audio-warning`), mantendo 100% operacionais o gráfico SVG, a navegação por teclado, os anúncios `aria-live`, as estatísticas, a tabela e a exportação.

### 3.3 Exploração por Teclado, Padrões Visuais e Exportação Acessível

- **Gráfico SVG Semântico (`chart-model.js`):** Suporta visualização em **Barras** ou **Linhas** nos temas **Claro** e **Alto Contraste AAA** (`>= 7:1`). Para cumprir o critério de não depender apenas da cor, as barras e estados ativos utilizam padrões SVG distintos (`pattern-diagonal` e `pattern-active-dots`).
- **Navegação Ponto a Ponto e `aria-live`:** Ao focar a região do explorador (`#chart-explorer`, `tabindex="0"`), o usuário navega com `←`, `→`, `Home` e `End` (ou botões *Anterior* / *Próximo*). A cada mudança de ponto, a região `#point-live-region` (`aria-live="polite"`, `aria-atomic="true"`) anuncia o índice, rótulo, valor e variação em relação ao ponto anterior (ex.: `"Ponto 3 de 6: Março, valor 42. Variação de +12 em relação a Fevereiro."`), destacando simultaneamente o ponto no gráfico e a linha correspondente na `<table class="data-table">` semântica (`<caption>`, `<th scope="col">`).
- **Exportação Autocontida (`exporter.js`):** A função `buildAccessibleHtmlPackage` gera um arquivo `.html` independente contendo CSS inline de alto contraste, o gráfico SVG com `<title>`, `<desc>` e padrões visuais, o resumo estatístico textual e a tabela semântica completa abaixo do gráfico. Todo conteúdo textual proveniente do usuário é sanitizado via `escapeHtml` (`&`, `<`, `>`, `"`, `'`).

---

## 4. Utilidade e Impacto na Sociedade

O **Dados Sonoros** atua simultaneamente em duas frentes complementares de impacto social:
1. **Autonomia para Pessoas Cegas e com Baixa Visão:** Permite que estudantes, pesquisadores e cidadãos importem dados de planilhas públicas, trabalhos escolares ou reportagens e compreendam rapidamente a distribuição numérica por meio da audição (sonificação) combinada à leitura precisa em tabela semântica e `aria-live`, sem depender de terceiros para descrever gráficos.
2. **Capacitação de Educadores, Jornalistas e Órgãos Públicos:** Professores de ensino básico e superior, ONGs e comunicadores sem conhecimento de programação passam a contar com uma ferramenta gratuita em português para gerar gráficos com alto contraste, padrões visuais e tabelas acopladas, prontos para incorporação em materiais didáticos e portais digitais.
3. **Privacidade e Custo Zero:** Ao rodar integralmente no navegador sem backend ou APIs pagas, dados institucionais, notas escolares ou indicadores sensíveis nunca deixam o dispositivo do usuário.

---

## 5. Avaliação Técnica: Qualidade, Segurança e Saúde em Produção

1. **Testes Automatizados (`QA_REPORT.md`):**
   - Comando executado: `npm test` (`node --test tests/*.test.js`), abrangendo 7 suítes (`chart-model.test.js`, `csv-parser.test.js`, `dom-smoke.test.js`, `exporter.test.js`, `sonifier.test.js`, `storage.test.js`, `stats.test.js`).
   - Resultado observado: **14/14 testes aprovados** (0 falhas, 0 ignorados), em `209.0192 ms` (`231.1036 ms` na verificação final de lançamento).
   - Observação não bloqueante identificada em QA: uso de `style="justify-content: center;"` em `index.html:90` sob CSP `style-src 'self'`.
2. **Auditoria de Segurança (`SECURITY_AUDIT.md`):**
   - Veredito: **APROVADO (`APPROVED`)**, com **0 achados críticos, altos ou médios**, **1 achado baixo** e **2 informativos**.
   - `LOW-01`: na reexportação para `.csv` (`escapeCsvField`), células iniciadas por `=`, `+`, `-`, `@`, `\t` ou `\r` não são prefixadas com apóstrofo (`'`), o que poderia acionar interpretação de fórmula em softwares de planilha caso o usuário reexporte um CSV de origem não confiável.
   - `INFO-01` e `INFO-02`: recomendação de headers HTTP complementares à `<meta>` CSP em servidor e ajuste de `path.sep` no script local `npm run serve`.
3. **Publicação e Monitoramento de Saúde (`LAUNCH_REPORT.md` & `HEALTH_REPORT.md`):**
   - URL em produção: `https://dados-sonoros-acessiveis.vercel.app` (deploy Vercel `dpl_FoJeTeFJ9wLwH2jn2MTEdd4VvT4F`, HTTP 200 OK; 10/10 recursos estáticos CSS/JS retornando HTTP 200 OK).
   - Repositório GitHub (privado): `https://github.com/ArthurAlvDev/dados-sonoros-acessiveis` (branch `main`, commit `2ad2cf8`).
   - Status de saúde pós-deploy: **HEALTHY (com ressalva menor de CSP)** — o monitoramento em navegador headless registrou 7 avisos não bloqueantes de `Content-Security-Policy` (`style-src 'self'`) decorrentes de 1 estilo inline em `index.html:90` e 6 atribuições de estilo inline em runtime em `src/js/app.js`, sem impedir o funcionamento principal da interface; recomenda-se migrá-los para classes CSS em manutenção futura.

---

## 6. Limitações Transparentes e Trabalhos Futuros

Conforme compromisso de rigor técnico e transparência em acessibilidade:
- **Ausência de testes reais com leitores de tela:** Não foram executados testes com **NVDA, VoiceOver ou JAWS** neste ciclo. Portanto, **não se declara conformidade certificada com leitores de tela** nem conformidade plena comprovada de WCAG 2.2 AA até que essa validação seja realizada.
- **Ausência de verificação física de áudio e E2E completo:** Embora a lógica de mapeamento sonoro e degradação graciosa tenha sido validada por testes unitários, a saída acústica real via Web Audio API e o fluxo interativo completo em múltiplos navegadores não foram testados em sessão E2E ao vivo.
- **Ausência de testes com usuários finais:** A eficácia perceptiva da sonificação (linear vs. logarítmica) e a clareza dos anúncios `aria-live` ainda não foram avaliadas empiricamente com pessoas cegas ou com baixa visão.

Como trabalhos futuros prioritários, destacam-se: (i) execução de testes sistemáticos com leitores de tela (NVDA, VoiceOver e JAWS) e validação física de áudio; (ii) migração dos estilos inline residuais para `src/styles/main.css` e mitigação do achado `LOW-01` (neutralização de fórmulas CSV); e (iii) estudo empírico de usabilidade com estudantes e profissionais cegos e educadores.

---

## Referências

1. **W3C — World Wide Web Consortium.** *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C Recommendation, 2023. Disponível em: https://www.w3.org/TR/WCAG22/
2. **Microsoft Research.** *Chart Reader: Accessible Data Visualization*. Disponível em: https://github.com/microsoft/chart-reader
3. **Chart2Music.** *Open-source library for accessible charts and sonification*. Disponível em: https://chart2music.com
4. **MIT Visualization Group.** *Olli: An extensible library for accessible data visualizations*. Disponível em: https://github.com/mitvis/olli
5. **Data Navigator.** *Accessible data visualization navigation library*. Disponível em: https://github.com/cmudig/data-navigator
6. **Highcharts.** *Highcharts Accessibility Module*. Disponível em: https://www.highcharts.com/docs/accessibility/accessibility-module
7. **MDN Web Docs.** *Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`)*. Mozilla Foundation. Disponível em: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
8. **FERREIRA, A. A.** *Dados Sonoros: estúdio e explorador web no-code para gráficos acessíveis, sonificação determinística e tabelas semânticas*. 2026. Software. Disponível em: https://github.com/ArthurAlvDev/dados-sonoros-acessiveis

---

### Nota sobre publicação

Este texto é um pré-print interno. **Não houve submissão a periódico nem depósito em repositório de dados nesta etapa.** A versão citável do software é o repositório público indicado acima, sob licença MIT; o texto segue sob CC BY 4.0. Ao depositar, substituir a nota do cabeçalho pelo DOI atribuído.
