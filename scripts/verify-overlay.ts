/**
 * Verificação offline do mapeamento: gera PDFs de amostra com a fonte padrão
 * Helvetica (não precisa de fontkit) e grava em /tmp para inspeção visual.
 * Uso: npx tsx scripts/verify-overlay.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { StandardFonts } from 'pdf-lib'
import { generateNotificationPdf } from '../src/services/pdf/pdf-generator'
import { createSampleForm } from '../src/features/notification/notification.defaults'

const templateBytes = readFileSync('public/templates/covid-2020/template.pdf')
const fontProvider = (doc: import('pdf-lib').PDFDocument) => doc.embedFont(StandardFonts.Helvetica)

for (const debug of [false, true]) {
  const { bytes, warnings } = await generateNotificationPdf(createSampleForm(), {
    templateBytes,
    fontProvider,
    debug,
  })
  const out = `/tmp/sample${debug ? '-debug' : ''}.pdf`
  writeFileSync(out, bytes)
  console.log(out, bytes.length, 'bytes', 'avisos:', JSON.stringify(warnings))
}
