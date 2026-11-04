# PDF Filler

Preenche a ficha **e-SUS Notifica – SG suspeito de COVID-19 (05/10/2020)** por um formulário web em 3 etapas + revisão, e gera o PDF **sobrepondo** textos e "X" ao PDF original (`public/templates/covid-2020/template.pdf`). Tudo roda no navegador: sem backend, banco, login, localStorage ou envio de dados.

> Ferramenta auxiliar. Não substitui o sistema oficial e-SUS Notifica.

## Executar
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run typecheck
npm run build && npm run preview
```
`npm run verify:overlay` gera `/tmp/sample.pdf` e `/tmp/sample-debug.pdf` (fonte Helvetica, sem fontkit) para inspeção visual.

## Estrutura
- `src/features/notification/` — modelo, opções (rótulos idênticos ao PDF), schema Zod, 3 etapas e revisão
- `src/services/pdf/` — `field-mapper.ts` (dados → operações), `pdf-generator.ts` (pdf-lib), `text-layout.ts` (ajuste/quebra de texto), `coordinate-utils.ts`, `debug-overlay.ts`, `pdf-renderer.ts` (pdf.js)
- `src/services/pdf/templates/covid-2020/coordinates.ts` — **único** lugar com posições (normalizadas 0–1, origem no canto superior esquerdo)
- `public/fonts/DejaVuSansCondensed.ttf` — fonte embutida (acentos/cedilha). Para usar Noto Sans, troque `FONT_FILE` em `pdf-fonts.ts`.

## Calibração
Em `npm run dev` aparece o painel de calibração: preencher com dados fictícios, grade 5 % e marcadores com o nome de cada campo no PDF gerado. Ajuste `coordinates.ts`; o painel não existe no build de produção.

## Observações
- O CNS tem 15 dígitos, mas a ficha tem 14 células: o 15º dígito é escrito logo após a última.
- Textos longos: a fonte é reduzida (mín. 6 pt) e, se ainda não couber, cortado com "…" — a revisão avisa quais campos.
- Nome do arquivo: `notificacao-covid-2020.pdf` (sem dados pessoais).
