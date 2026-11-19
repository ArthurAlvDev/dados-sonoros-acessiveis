# HEALTH_REPORT — Dados Sonoros (`dados-sonoros-acessiveis`)

- **Data/Hora da Verificação:** 2026-11-17T09:44-03:00
- **Responsável:** `post-deployment-monitor`
- **Projeto Vercel:** `dados-sonoros-acessiveis` (`prj_u4ILASWiOheosqM5UiTNtMcLdsSH`, time `olacdevs-projects`)
- **Deploy de Produção:** `dpl_FoJeTeFJ9wLwH2jn2MTEdd4VvT4F` (`readyState: READY`, `target: production`)
- **Status Geral:** **HEALTHY (com ressalva menor de CSP)**

---

## 1. Disponibilidade de URLs e Aliases

| URL | Método | HTTP | Latência | Cache Vercel |
| :--- | :--- | :--- | :--- | :--- |
| `https://dados-sonoros-acessiveis.vercel.app` | HEAD | 200 | 434 ms | `HIT` |
| `https://dados-sonoros-acessiveis.vercel.app/robots.txt` | HEAD | 200 | 331 ms | `MISS` |
| `https://dados-sonoros-acessiveis-olacdevs-projects.vercel.app` | HEAD | 200 | 551 ms | `HIT` |
| `https://dados-sonoros-acessiveis-git-main-olacdevs-projects.vercel.app` | HEAD | 200 | 814 ms | `HIT` |

---

## 2. Carregamento de Recursos Estáticos (10/10 HTTP 200)

| Recurso | HTTP | Latência | Content-Type | Tamanho |
| :--- | :--- | :--- | :--- | :--- |
| `src/styles/tokens.css` | 200 | 382 ms | `text/css; charset=utf-8` | 2435 B |
| `src/styles/main.css` | 200 | 351 ms | `text/css; charset=utf-8` | 7900 B |
| `src/js/datasets.js` | 200 | 178 ms | `application/javascript; charset=utf-8` | 2195 B |
| `src/js/csv-parser.js` | 200 | 177 ms | `application/javascript; charset=utf-8` | 4270 B |
| `src/js/stats.js` | 200 | 174 ms | `application/javascript; charset=utf-8` | 2114 B |
| `src/js/sonifier.js` | 200 | 189 ms | `application/javascript; charset=utf-8` | 6753 B |
| `src/js/chart-model.js` | 200 | 181 ms | `application/javascript; charset=utf-8` | 3926 B |
| `src/js/storage.js` | 200 | 178 ms | `application/javascript; charset=utf-8` | 3960 B |
| `src/js/exporter.js` | 200 | 175 ms | `application/javascript; charset=utf-8` | 5603 B |
| `src/js/app.js` | 200 | 175 ms | `application/javascript; charset=utf-8` | 26150 B |

---

## 3. Renderização e Diagnóstico no Navegador

- **Título carregado:** `Dados Sonoros — Gráficos Acessíveis, Sonificação e Tabelas Semânticas`
- **Estado da UI:** Todos os módulos renderizados corretamente (controles de tema e gráfico, tabela editável, resumo estatístico com 6 pontos `Jan`–`Jun`, gráfico SVG acessível, tabela semântica sincronizada e botões de exportação).
- **Achado não bloqueante (Console / CSP):** Foram registrados 7 erros de `Content-Security-Policy` (`style-src 'self'`):
  - 1 ocorrência em `index.html` (linha 90: `style="justify-content: center;"` em `#empty-sample-buttons`).
  - 6 ocorrências originadas em `src/js/app.js` ao aplicar estilos inline em runtime.
  - **Impacto:** O navegador bloqueia esses estilos inline específicos, sem impedir o funcionamento principal da aplicação. Recomenda-se migrá-los para classes em `src/styles/main.css` em um próximo ciclo de manutenção.

---

## 4. Limitações da Verificação e Escopo

- Não houve alterações destrutivas no código, repositório ou deploy.
- Não foi testada saída física de áudio via Web Audio API nem navegação com leitores de tela reais (NVDA/VoiceOver/JAWS).
