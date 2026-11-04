import { PDFFont, PDFPage, rgb } from 'pdf-lib'
import { baselineFromCenter, toPdfPoint, type MediaBox } from './coordinate-utils'
import type { TemplateCoordinates } from './types'

/**
 * Camada de calibração (somente desenvolvimento): grade 5 % × 5 %, cruz em cada
 * ponto mapeado e o nome do campo. Serve para ajustar `coordinates.ts`.
 */

const GRID = rgb(0.2, 0.5, 0.95)
const MARK = rgb(0.9, 0.1, 0.1)

type Node = Record<string, unknown>
const isNum = (v: unknown): v is number => typeof v === 'number'

/** Percorre o mapa de coordenadas e devolve os pontos nomeados. */
export const collectMarkers = (
  coordinates: TemplateCoordinates,
): { name: string; x: number; y: number; kind: 'check' | 'text' | 'cell' }[] => {
  const out: { name: string; x: number; y: number; kind: 'check' | 'text' | 'cell' }[] = []
  const walk = (node: Node, path: string) => {
    const keys = Object.keys(node)
    if (Array.isArray(node.xs) && isNum(node.y)) {
      ;(node.xs as number[]).forEach((x, idx) =>
        out.push({ name: idx === 0 ? path : '', x, y: node.y as number, kind: 'cell' }),
      )
      return
    }
    if (isNum(node.firstBaseline) && isNum(node.x)) {
      out.push({ name: path, x: node.x, y: node.firstBaseline, kind: 'text' })
      return
    }
    if (isNum(node.x) && isNum(node.y) && isNum(node.fontSize)) {
      out.push({ name: path, x: node.x, y: node.y, kind: 'text' })
      return
    }
    if (isNum(node.x) && isNum(node.y) && keys.length === 2) {
      out.push({ name: path, x: node.x, y: node.y, kind: 'check' })
      return
    }
    for (const key of keys) {
      const child = node[key]
      if (child && typeof child === 'object') walk(child as Node, path ? `${path}.${key}` : key)
    }
  }
  walk(coordinates as unknown as Node, '')
  return out
}

export const drawDebugOverlay = (
  page: PDFPage,
  font: PDFFont,
  box: MediaBox,
  coordinates: TemplateCoordinates,
): void => {
  // Grade a cada 5 % (linha mais forte a cada 25 %)
  for (let i = 0; i <= 20; i++) {
    const n = i / 20
    const strong = i % 5 === 0
    const v = toPdfPoint(n, n, box)
    const opts = { color: GRID, thickness: strong ? 0.5 : 0.2, opacity: strong ? 0.7 : 0.4 }
    page.drawLine({ start: { x: v.x, y: box.y }, end: { x: v.x, y: box.y + box.height }, ...opts })
    page.drawLine({ start: { x: box.x, y: v.y }, end: { x: box.x + box.width, y: v.y }, ...opts })
    if (strong) {
      const label = `${Math.round(n * 100)}%`
      page.drawText(label, { x: v.x + 1, y: box.y + box.height - 6, size: 5, font, color: GRID })
      page.drawText(label, { x: box.x + 1, y: v.y + 1, size: 5, font, color: GRID })
    }
  }

  for (const m of collectMarkers(coordinates)) {
    const p = toPdfPoint(m.x, m.y, box)
    const r = m.kind === 'cell' ? 1.5 : 2.2
    page.drawLine({ start: { x: p.x - r, y: p.y }, end: { x: p.x + r, y: p.y }, color: MARK, thickness: 0.4 })
    page.drawLine({ start: { x: p.x, y: p.y - r }, end: { x: p.x, y: p.y + r }, color: MARK, thickness: 0.4 })
    if (m.name) {
      const short = m.name.split('.').slice(-2).join('.')
      const y = m.kind === 'text' ? baselineFromCenter(p.y, 4) - 4 : p.y - 6
      page.drawText(short, { x: p.x + 2, y, size: 3.6, font, color: MARK })
    }
  }
}
