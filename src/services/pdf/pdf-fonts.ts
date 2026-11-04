import type { PDFDocument, PDFFont } from 'pdf-lib'

/**
 * Fonte TTF com suporte completo ao português (acentos e cedilha).
 * DejaVu Sans Condensed (licença livre) — a versão condensada ajuda o texto a
 * caber nas células estreitas da ficha. Para trocar de fonte, coloque outro
 * .ttf em `public/fonts/` e altere a constante abaixo (ex.: NotoSans-Regular.ttf).
 */
export const FONT_FILE = 'fonts/DejaVuSansCondensed.ttf'

/** URL resolvida em tempo de execução (respeita o `base` do Vite). */
export const fontUrl = (): string => `${import.meta.env?.BASE_URL ?? '/'}${FONT_FILE}`

export type FontProvider = (doc: PDFDocument) => Promise<PDFFont>

let fontBytesPromise: Promise<ArrayBuffer> | null = null

const fetchFontBytes = (): Promise<ArrayBuffer> => {
  fontBytesPromise ??= fetch(fontUrl()).then((res) => {
    if (!res.ok) throw new Error(`Não foi possível carregar a fonte (${res.status})`)
    return res.arrayBuffer()
  })
  return fontBytesPromise
}

/** Provedor padrão: embute a TTF via `@pdf-lib/fontkit` (carregado sob demanda). */
export const embedDefaultFont: FontProvider = async (doc) => {
  const [{ default: fontkit }, bytes] = await Promise.all([
    import('@pdf-lib/fontkit'),
    fetchFontBytes(),
  ])
  doc.registerFontkit(fontkit)
  // subset: true mantém o arquivo final pequeno
  return doc.embedFont(bytes, { subset: true })
}
