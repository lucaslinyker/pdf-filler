export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">PDF Filler</h1>
          <p className="text-xs text-slate-500">Ficha de investigação de SG suspeito de COVID-19 · e-SUS Notifica (05/10/2020)</p>
        </div>
        <p className="hidden max-w-sm text-right text-xs text-slate-500 md:block">
          Os dados são processados somente neste navegador: nada é enviado, salvo ou registrado.
        </p>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1600px] px-4 py-4 text-xs text-slate-500 sm:px-6">
      Ferramenta auxiliar de preenchimento e impressão. <strong>Não substitui o sistema oficial e-SUS Notifica.</strong>
    </footer>
  )
}
