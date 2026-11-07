export interface StepDef {
  id: string
  title: string
}

interface StepperProps {
  steps: StepDef[]
  current: number
  onSelect: (index: number) => void
}

/** Indicador de etapa + navegação direta entre as etapas. */
export function Stepper({ steps, current, onSelect }: StepperProps) {
  return (
    <nav aria-label="Etapas do formulário">
      <ol className="grid grid-cols-4 gap-2">
        {steps.map((step, i) => {
          const active = i === current
          const done = i < current
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                className={`flex w-full flex-col items-start gap-1 h-full justify-between rounded-lg border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  active
                    ? 'border-teal-700 bg-teal-50'
                    : done
                      ? 'border-teal-200 bg-white hover:bg-teal-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    active ? 'bg-teal-700 text-white' : done ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className={`text-xs font-medium leading-tight sm:text-sm ${active ? 'text-teal-900' : 'text-slate-700'}`}>
                  {step.title}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
