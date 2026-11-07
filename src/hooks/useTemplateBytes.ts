import { useEffect, useState } from 'react'
import { loadTemplateBytes } from '../services/pdf/pdf-template'

/** Carrega o PDF original (modelo em branco) para a pré-visualização inicial. */
export function useTemplateBytes(): Uint8Array | null {
  const [bytes, setBytes] = useState<Uint8Array | null>(null)
  useEffect(() => {
    let cancelled = false
    loadTemplateBytes()
      .then((b) => !cancelled && setBytes(new Uint8Array(b)))
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])
  return bytes
}
