import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { DevTools } from './components/layout/DevTools'
import { Footer, Header } from './components/layout/Header'
import { Stepper, type StepDef } from './components/layout/Stepper'
import { PdfPreview } from './components/pdf-preview/PdfPreview'
import { Button } from './components/ui/Button'
import { ClinicalForm } from './features/notification/components/ClinicalForm'
import { ClosureForm } from './features/notification/components/ClosureForm'
import { IdentificationForm } from './features/notification/components/IdentificationForm'
import { ReviewPanel } from './features/notification/components/ReviewPanel'
import { createEmptyForm, createSampleForm } from './features/notification/notification.defaults'
import { notificationSchema, type NotificationFormInput } from './features/notification/notification.schema'
import type { NotificationForm } from './features/notification/notification.types'
import { usePdfGeneration } from './hooks/usePdfGeneration'
import { useTemplateBytes } from './hooks/useTemplateBytes'
import { DEFAULT_FILE_NAME } from './services/pdf/pdf-generator'
import { downloadPdf, printPdf } from './utils/download'

const STEPS: StepDef[] = [
  { id: 'identification', title: 'Identificação' },
  { id: 'clinical', title: 'Dados clínicos epidemiológicos' },
  { id: 'closure', title: 'Encerramento' },
  { id: 'review', title: 'Revisão e PDF' },
]
const REVIEW = 3
const STEP_FIELD = ['identification', 'clinical', 'closure'] as const

export default function App() {
  const form = useForm<NotificationFormInput>({
    resolver: zodResolver(notificationSchema),
    defaultValues: createEmptyForm() as NotificationFormInput,
    mode: 'onBlur',
  })
  const { trigger, getValues, reset, watch, formState } = form

  const [step, setStep] = useState(0)
  const [pane, setPane] = useState<'form' | 'preview'>('form')
  const [stale, setStale] = useState(false)
  const [debug, setDebug] = useState(false)
  const { result, generating, error, generate, reset: resetResult } = usePdfGeneration()
  const templateBytes = useTemplateBytes()

  // O PDF gerado fica desatualizado assim que qualquer campo muda.
  useEffect(() => {
    const sub = watch(() => setStale(true))
    return () => sub.unsubscribe()
  }, [watch])

  // Evita perder o preenchimento (que não é salvo em lugar nenhum) por engano.
  useEffect(() => {
    if (!formState.isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [formState.isDirty])

  const currentValues = watch() as unknown as NotificationForm

  const runGenerate = useCallback(
    async (withDebug: boolean) => {
      await trigger() // exibe os erros de formato nos campos
      const parsed = notificationSchema.safeParse(getValues())
      if (!parsed.success) {
        // Leva o usuário à primeira etapa que contém erro.
        const section = parsed.error.issues[0]?.path[0]
        const first = STEP_FIELD.findIndex((k) => k === section)
        setStep(first >= 0 ? first : 0)
        return
      }
      if (await generate(parsed.data, withDebug)) {
        setStale(false)
        setPane('preview')
      }
    },
    [trigger, getValues, generate],
  )

  // Em desenvolvimento, alternar a calibração atualiza o PDF já gerado.
  useEffect(() => {
    if (import.meta.env.DEV && result) void runGenerate(debug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debug])

  const next = async () => {
    if (step < REVIEW) {
      const ok = await trigger(STEP_FIELD[step])
      if (ok) setStep(step + 1)
    }
  }

  const clearAll = () => {
    if (!window.confirm('Limpar todos os dados e iniciar um novo preenchimento?')) return
    reset(createEmptyForm() as NotificationFormInput)
    resetResult()
    setStale(false)
    setStep(0)
    setPane('form')
  }

  const previewBytes = result?.bytes ?? templateBytes
  const caption = result
    ? stale
      ? 'PDF gerado — desatualizado em relação ao formulário'
      : 'PDF preenchido'
    : 'Modelo original (em branco)'

  return (
    <FormProvider {...form}>
      <div className="flex min-h-screen flex-col">
        <Header />

        {/* Alternância formulário / visualização (somente telas pequenas) */}
        <div className="mx-auto mt-3 flex w-full max-w-[1600px] gap-2 px-4 lg:hidden">
          <Button className="flex-1" variant={pane === 'form' ? 'primary' : 'secondary'} onClick={() => setPane('form')}>
            Formulário
          </Button>
          <Button className="flex-1" variant={pane === 'preview' ? 'primary' : 'secondary'} onClick={() => setPane('preview')}>
            Visualizar PDF
          </Button>
        </div>

        <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className={`${pane === 'form' ? 'block' : 'hidden'} min-w-0 space-y-4 lg:block`}>
            <Stepper steps={STEPS} current={step} onSelect={setStep} />
            {import.meta.env.DEV && (
              <DevTools
                debug={debug}
                onToggleDebug={setDebug}
                onFillSample={() => reset(createSampleForm() as NotificationFormInput, { keepDefaultValues: true })}
              />
            )}

            <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-5">
              {step === 0 && <IdentificationForm />}
              {step === 1 && <ClinicalForm />}
              {step === 2 && <ClosureForm />}
              {step === REVIEW && (
                <ReviewPanel
                  values={currentValues}
                  generating={generating}
                  hasResult={!!result}
                  stale={stale}
                  warnings={result?.warnings ?? []}
                  error={error}
                  onEditStep={setStep}
                  onGenerate={() => void runGenerate(import.meta.env.DEV && debug)}
                  onDownload={() => result && downloadPdf(result.bytes, DEFAULT_FILE_NAME)}
                  onPrint={() => result && printPdf(result.bytes)}
                  onClear={clearAll}
                />
              )}

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <Button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                  ← Voltar
                </Button>
                {step < REVIEW ? (
                  <Button variant="primary" onClick={() => void next()}>
                    {step === REVIEW - 1 ? 'Revisar →' : 'Avançar →'}
                  </Button>
                ) : (
                  <span className="text-xs text-slate-500">Use “Editar” para corrigir qualquer etapa.</span>
                )}
              </div>
            </form>
          </div>

          <div className={`${pane === 'preview' ? 'block' : 'hidden'} min-w-0 lg:block`}>
            <div className="h-[calc(100vh-7rem)] min-h-[480px] lg:sticky lg:top-4">
              <PdfPreview bytes={previewBytes} caption={caption} />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </FormProvider>
  )
}
