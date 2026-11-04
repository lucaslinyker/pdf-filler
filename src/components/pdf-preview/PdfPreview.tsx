import { useEffect, useRef, useState } from 'react'
import { loadPdf, type LoadedPdf } from '../../services/pdf/pdf-renderer'
import { Button } from '../ui/Button'

interface PdfPreviewProps {
  /** Bytes do PDF a exibir (modelo original ou PDF gerado). */
  bytes: Uint8Array | null
  caption?: string
}

type Zoom = 'fit' | number

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]

/**
 * Visualização com pdf.js: página inteira, proporção A4 preservada, ajuste à
 * largura disponível ou zoom manual.
 */
export function PdfPreview({ bytes, caption }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdf, setPdf] = useState<LoadedPdf | null>(null)
  const [width, setWidth] = useState(0)
  const [zoom, setZoom] = useState<Zoom>('fit')
  const [error, setError] = useState<string | null>(null)

  // Carrega o documento quando os bytes mudam.
  useEffect(() => {
    if (!bytes) {
      setPdf(null)
      return
    }
    let cancelled = false
    let loaded: LoadedPdf | null = null
    setError(null)
    loadPdf(bytes)
      .then((p) => {
        if (cancelled) return p.destroy()
        loaded = p
        setPdf(p)
      })
      .catch(() => !cancelled && setError('Não foi possível exibir o PDF.'))
    return () => {
      cancelled = true
      loaded?.destroy()
    }
  }, [bytes])

  // Acompanha a largura disponível (diferentes resoluções / janela redimensionada).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    setWidth(Math.floor(el.clientWidth))
    return () => ro.disconnect()
  }, [])

  const cssWidth = zoom === 'fit' ? width : Math.round((pdf?.pageWidth ?? 595) * zoom * (96 / 72))

  // Renderiza a página sempre que documento, largura ou zoom mudam.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!pdf || !canvas || cssWidth <= 0) return
    const task = pdf.render(canvas, cssWidth)
    task.promise.catch((e: unknown) => {
      if ((e as { name?: string })?.name !== 'RenderingCancelledException') setError('Falha ao renderizar o PDF.')
    })
    return () => task.cancel()
  }, [pdf, cssWidth])

  const stepZoom = (dir: 1 | -1) => {
    const current = zoom === 'fit' ? (width / ((pdf?.pageWidth ?? 595) * (96 / 72))) : zoom
    const next =
      dir === 1
        ? ZOOM_STEPS.find((z) => z > current + 0.01) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]
        : [...ZOOM_STEPS].reverse().find((z) => z < current - 0.01) ?? ZOOM_STEPS[0]
    setZoom(next)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-600">{caption}</p>
        <div className="flex items-center gap-1">
          <Button className="px-2 py-1 text-xs" onClick={() => stepZoom(-1)} aria-label="Diminuir zoom">
            −
          </Button>
          <Button className="px-2 py-1 text-xs" onClick={() => setZoom('fit')} aria-pressed={zoom === 'fit'}>
            Ajustar à largura
          </Button>
          <Button className="px-2 py-1 text-xs" onClick={() => stepZoom(1)} aria-label="Aumentar zoom">
            +
          </Button>
        </div>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-300 bg-slate-200 p-2">
        {error ? (
          <p role="alert" className="p-4 text-sm text-red-700">
            {error}
          </p>
        ) : !pdf ? (
          <p className="p-4 text-sm text-slate-500">Carregando visualização…</p>
        ) : (
          <canvas ref={canvasRef} className="mx-auto block bg-white shadow-md" aria-label="Pré-visualização do PDF" />
        )}
      </div>
    </div>
  )
}
