import type { PDFFont } from 'pdf-lib'

/** Mede a largura de um texto na fonte/tamanho dados. */
export type Measure = (text: string, size: number) => number

export const measureWith =
  (font: PDFFont): Measure =>
  (text, size) =>
    font.widthOfTextAtSize(text, size)

const ELLIPSIS = '…'

/**
 * Normaliza o texto para uma única linha: NFC, remove caracteres de controle e
 * troca quebras de linha/tabulações por espaço.
 */
export const toSingleLine = (value: string): string =>
  value
    .normalize('NFC')
    // eslint-disable-next-line no-control-regex
    .replace(/[\r\n\t]+/g, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

/** Normaliza preservando quebras de linha (para observações). */
export const toMultiLine = (value: string): string =>
  value
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
    .trim()

/** Troca por '?' os caracteres que a fonte não consegue representar. */
export const replaceUnsupported = (value: string, supported: (cp: number) => boolean): string =>
  Array.from(value)
    .map((ch) => (supported(ch.codePointAt(0) as number) ? ch : '?'))
    .join('')

export interface FitResult {
  text: string
  fontSize: number
  /** Fonte reduzida abaixo do tamanho nominal. */
  shrunk: boolean
  /** Texto cortado com reticências (não coube nem no tamanho mínimo). */
  truncated: boolean
}

/**
 * Ajusta um texto de linha única à largura disponível: primeiro reduz a fonte
 * (até `minSize`), depois trunca com reticências.
 */
export const fitSingleLine = (
  measure: Measure,
  text: string,
  fontSize: number,
  maxWidth: number,
  minSize = 6,
): FitResult => {
  let size = fontSize
  while (measure(text, size) > maxWidth && size > minSize) {
    size = Math.max(minSize, Math.round((size - 0.25) * 100) / 100)
  }
  if (measure(text, size) <= maxWidth) {
    return { text, fontSize: size, shrunk: size < fontSize, truncated: false }
  }
  const chars = Array.from(text)
  while (chars.length > 0 && measure(chars.join('').trimEnd() + ELLIPSIS, size) > maxWidth) {
    chars.pop()
  }
  return {
    text: chars.length > 0 ? chars.join('').trimEnd() + ELLIPSIS : '',
    fontSize: size,
    shrunk: size < fontSize,
    truncated: true,
  }
}

/** Quebra um texto em linhas que caibam em `maxWidth` (respeita `\n`). */
export const wrapText = (
  measure: Measure,
  text: string,
  fontSize: number,
  maxWidth: number,
): string[] => {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      continue
    }
    let current = ''
    const flush = () => {
      if (current) lines.push(current)
      current = ''
    }
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (measure(candidate, fontSize) <= maxWidth) {
        current = candidate
        continue
      }
      flush()
      if (measure(word, fontSize) <= maxWidth) {
        current = word
        continue
      }
      // palavra maior que a linha: quebra por caractere
      let piece = ''
      for (const ch of Array.from(word)) {
        if (measure(piece + ch, fontSize) > maxWidth && piece) {
          lines.push(piece)
          piece = ch
        } else {
          piece += ch
        }
      }
      current = piece
    }
    flush()
  }
  return lines
}

export interface MultilineFit {
  lines: string[]
  fontSize: number
  shrunk: boolean
  truncated: boolean
}

/**
 * Ajusta um texto longo a um número máximo de linhas: reduz a fonte até
 * `minSize`; se ainda não couber, corta e coloca reticências na última linha.
 */
export const fitMultiline = (
  measure: Measure,
  text: string,
  fontSize: number,
  maxWidth: number,
  maxLines: number,
  minSize = 6,
): MultilineFit => {
  let size = fontSize
  let lines = wrapText(measure, text, size, maxWidth)
  while (lines.length > maxLines && size > minSize) {
    size = Math.max(minSize, Math.round((size - 0.25) * 100) / 100)
    lines = wrapText(measure, text, size, maxWidth)
  }
  if (lines.length <= maxLines) {
    return { lines, fontSize: size, shrunk: size < fontSize, truncated: false }
  }
  const kept = lines.slice(0, maxLines)
  const last = fitSingleLine(measure, kept[maxLines - 1] + ' ' + ELLIPSIS, size, maxWidth, size)
  kept[maxLines - 1] = last.text.endsWith(ELLIPSIS) ? last.text : last.text + ELLIPSIS
  return { lines: kept, fontSize: size, shrunk: size < fontSize, truncated: true }
}
