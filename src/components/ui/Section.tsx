import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

/** Bloco visual que agrupa campos relacionados (espelha os quadros da ficha). */
export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800">{title}</h3>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

/** Grade responsiva de campos. */
export function FieldGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const map = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' } as const
  return <div className={`grid grid-cols-1 gap-4 ${map[cols]}`}>{children}</div>
}
