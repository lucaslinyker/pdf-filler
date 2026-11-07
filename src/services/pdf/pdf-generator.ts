import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { NotificationForm } from '../../features/notification/notification.types'
import { baselineFromCenter, toPdfPoint, toPoints, type MediaBox } from './coordinate-utils'
import { drawDebugOverlay } from './debug-overlay'
import { buildDrawOps, type DrawOp } from './field-mapper'
import { embedDefaultFont, type FontProvider } from './pdf-fonts'
import {
  fitMultiline,
  fitSingleLine,
  measureWith,
  replaceUnsupported,
  type Measure,
} from './text-layout'
import { coordinates as covid2020 } from './templates/covid-2020/coordinates'
import type { TemplateCoordinates } from './types'
import { loadTemplateBytes } from './pdf-template'

export const DEFAULT_FILE_NAME = 'notificacao-covid-2020.pdf'

const INK = rgb(0.05, 0.05, 0.35) // azul-escuro: distingue o preenchimento do impresso

export interface GenerationWarning {
  field: string
  type: 'shrunk' | 'truncated'
}

export interface GenerationResult {
  bytes: Uint8Array
  /** Campos cujo texto precisou ser reduzido ou cortado (nunca contém dados do paciente). */
  warnings: GenerationWarning[]
}

export interface GenerateOptions {
  /** Bytes do template; padrão: baixa `public/templates/covid-2020/template.pdf`. */
  templateBytes?: ArrayBuffer | Uint8Array
  coordinates?: TemplateCoordinates
  fontProvider?: FontProvider
  /** Desenha grade e marcadores de calibração (usar apenas em desenvolvimento). */
  debug?: boolean
}

const mediaBoxOf = (page: PDFPage): MediaBox => {
  const { x, y, width, height } = page.getMediaBox()
  return { x, y, width, height }
}

/** Largura do passo entre células (usada para prolongar o CNS além da 14ª célula). */
const cellPitch = (xs: number[]): number =>
  xs.length > 1 ? (xs[xs.length - 1] - xs[0]) / (xs.length - 1) : 0

const drawX = (page: PDFPage, cx: number, cy: number) => {
  const h = 3.3 // meia-diagonal: o X fica dentro da caixa (≈ 15 × 8,8 pt)
  const opts = { color: INK, thickness: 1.1 }
  page.drawLine({ start: { x: cx - h, y: cy - h }, end: { x: cx + h, y: cy + h }, ...opts })
  page.drawLine({ start: { x: cx - h, y: cy + h }, end: { x: cx + h, y: cy - h }, ...opts })
}

interface RenderContext {
  page: PDFPage
  font: PDFFont
  box: MediaBox
  measure: Measure
  size: { width: number; height: number }
  warnings: GenerationWarning[]
  clean: (value: string) => string
}

const renderOp = (op: DrawOp, ctx: RenderContext): void => {
  const { page, font, box, measure, size, warnings, clean } = ctx
  switch (op.kind) {
    case 'check': {
      const p = toPdfPoint(op.point.x, op.point.y, box)
      drawX(page, p.x, p.y)
      return
    }
    case 'text': {
      const { spec } = op
      const fit = fitSingleLine(measure, clean(op.text), spec.fontSize, toPoints(spec.maxWidth, size, 'x'))
      if (fit.shrunk) warnings.push({ field: op.field, type: 'shrunk' })
      if (fit.truncated) warnings.push({ field: op.field, type: 'truncated' })
      const p = toPdfPoint(spec.x, spec.y, box)
      page.drawText(fit.text, {
        x: p.x,
        y: baselineFromCenter(p.y, fit.fontSize),
        size: fit.fontSize,
        font,
        color: INK,
      })
      return
    }
    case 'cells': {
      const { spec } = op
      const pitch = cellPitch(spec.xs)
      op.values.forEach((value, idx) => {
        const text = clean(value)
        const nx = idx < spec.xs.length ? spec.xs[idx] : spec.xs[spec.xs.length - 1] + pitch * (idx - spec.xs.length + 1)
        const p = toPdfPoint(nx, spec.y, box)
        const w = font.widthOfTextAtSize(text, spec.fontSize)
        page.drawText(text, {
          x: p.x - w / 2, // centralizado na célula
          y: baselineFromCenter(p.y, spec.fontSize),
          size: spec.fontSize,
          font,
          color: INK,
        })
      })
      return
    }
    case 'multiline': {
      const { spec } = op
      const fit = fitMultiline(
        measure,
        clean(op.text),
        spec.fontSize,
        toPoints(spec.maxWidth, size, 'x'),
        spec.maxLines,
      )
      if (fit.shrunk) warnings.push({ field: op.field, type: 'shrunk' })
      if (fit.truncated) warnings.push({ field: op.field, type: 'truncated' })
      const x = toPdfPoint(spec.x, 0, box).x
      fit.lines.forEach((line, idx) => {
        const y = toPdfPoint(0, spec.firstBaseline + idx * spec.lineGap, box).y
        page.drawText(line, { x, y, size: fit.fontSize, font, color: INK })
      })
      return
    }
  }
}

/**
 * Gera o PDF preenchido: carrega o modelo original e SOBREPÕE textos e marcas
 * "X" nas posições mapeadas. O conteúdo impresso do modelo não é alterado.
 */
export const generateNotificationPdf = async (
  form: NotificationForm,
  options: GenerateOptions = {},
): Promise<GenerationResult> => {
  const coordinates = options.coordinates ?? covid2020
  const templateBytes = options.templateBytes ?? (await loadTemplateBytes())
  const doc = await PDFDocument.load(templateBytes)

  const page = doc.getPage(0)
  const font = await (options.fontProvider ?? embedDefaultFont)(doc)
  const supported = new Set(font.getCharacterSet())
  const clean = (value: string) => replaceUnsupported(value, (cp) => supported.has(cp))

  const box = mediaBoxOf(page)
  const ctx: RenderContext = {
    page,
    font,
    box,
    measure: measureWith(font),
    size: { width: box.width, height: box.height },
    warnings: [],
    clean,
  }

  for (const op of buildDrawOps(form, coordinates)) renderOp(op, ctx)
  if (options.debug) drawDebugOverlay(page, font, box, coordinates)

  doc.setTitle('Ficha de investigação de SG suspeito de COVID-19 (preenchida)')
  doc.setCreator('PDF Filler')
  doc.setProducer('PDF Filler (pdf-lib)')

  return { bytes: await doc.save(), warnings: ctx.warnings }
}
