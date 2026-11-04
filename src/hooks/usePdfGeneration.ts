import { useCallback, useState } from 'react'
import type { NotificationForm } from '../features/notification/notification.types'
import { generateNotificationPdf, type GenerationResult } from '../services/pdf/pdf-generator'

/** Estado da geração do PDF. Os bytes ficam apenas em memória. */
export function usePdfGeneration() {
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (form: NotificationForm, debug: boolean) => {
    setGenerating(true)
    setError(null)
    try {
      setResult(await generateNotificationPdf(form, { debug }))
      return true
    } catch (e) {
      // Nunca registrar dados do paciente: loga apenas o tipo do erro.
      console.error('Falha ao gerar PDF:', e instanceof Error ? e.name : 'erro desconhecido')
      setError('Não foi possível gerar o PDF. Verifique se o modelo e a fonte foram carregados e tente novamente.')
      return false
    } finally {
      setGenerating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, generating, error, generate, reset }
}
