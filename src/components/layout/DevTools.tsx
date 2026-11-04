import { Button } from '../ui/Button'

interface DevToolsProps {
  debug: boolean
  onToggleDebug: (value: boolean) => void
  onFillSample: () => void
}

/**
 * Ferramentas de calibração. Só são montadas em desenvolvimento
 * (`import.meta.env.DEV`); na versão de produção ficam fora do bundle.
 */
export function DevTools({ debug, onToggleDebug, onFillSample }: DevToolsProps) {
  return (
    <div className="rounded-lg border border-dashed border-fuchsia-400 bg-fuchsia-50 p-3 text-xs text-fuchsia-900">
      <p className="mb-2 font-semibold">Modo de desenvolvimento · calibração do mapeamento</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={debug} onChange={(e) => onToggleDebug(e.target.checked)} />
          Grade e marcadores de campos no PDF gerado
        </label>
        <Button className="px-2 py-1 text-xs" onClick={onFillSample}>
          Preencher com dados fictícios
        </Button>
      </div>
      <p className="mt-2 text-fuchsia-800">
        Ajuste as posições em <code>src/services/pdf/templates/covid-2020/coordinates.ts</code>; a página recarrega sozinha.
      </p>
    </div>
  )
}
