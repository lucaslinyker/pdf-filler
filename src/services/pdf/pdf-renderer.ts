import * as pdfjs from 'pdfjs-dist'
// O worker é empacotado pelo Vite como asset e carregado por URL (sem CDN).
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export interface LoadedPdf {
  /** Largura/altura da página 1 em pontos (escala 1). */
  pageWidth: number
  pageHeight: number
  /** Renderiza a página 1 no canvas, na largura CSS pedida. Devolve `cancel`. */
  render: (canvas: HTMLCanvasElement, cssWidth: number) => { promise: Promise<void>; cancel: () => void }
  destroy: () => void
}

/**
 * Abre um PDF a partir dos bytes (em memória — nenhuma URL é criada) e prepara
 * a renderização da primeira página com pdf.js.
 */
export const loadPdf = async (bytes: Uint8Array): Promise<LoadedPdf> => {
  // pdf.js transfere o buffer ao worker; passamos uma cópia para preservar o original.
  const task = pdfjs.getDocument({ data: bytes.slice() })
  const doc = await task.promise
  const page = await doc.getPage(1)
  const base = page.getViewport({ scale: 1 })

  return {
    pageWidth: base.width,
    pageHeight: base.height,
    render: (canvas, cssWidth) => {
      const scale = cssWidth / base.width
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const viewport = page.getViewport({ scale: scale * dpr })
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${(cssWidth * base.height) / base.width}px`
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D indisponível')
      // `canvas` é exigido pelo pdf.js ≥ 5 e `canvasContext` pelo 4.x; passamos ambos.
      const params = { canvasContext: ctx, canvas, viewport } as unknown as Parameters<typeof page.render>[0]
      const renderTask = page.render(params)
      return { promise: renderTask.promise, cancel: () => renderTask.cancel() }
    },
    destroy: () => {
      void doc.destroy()
    },
  }
}
