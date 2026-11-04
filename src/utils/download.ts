/**
 * Download e impressão do PDF gerado. As Object URLs são criadas só no momento
 * do uso e liberadas logo depois (nada fica retido em memória).
 */

const toBlob = (bytes: Uint8Array): Blob => new Blob([bytes.slice()], { type: 'application/pdf' })

export const downloadPdf = (bytes: Uint8Array, fileName: string): void => {
  const url = URL.createObjectURL(toBlob(bytes))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Libera após o navegador iniciar o download.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export const printPdf = (bytes: Uint8Array): void => {
  const url = URL.createObjectURL(toBlob(bytes))
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  iframe.src = url

  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    iframe.remove()
    URL.revokeObjectURL(url)
  }

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch {
      // Fallback: abre em nova aba para o usuário imprimir manualmente.
      window.open(url, '_blank', 'noopener')
    }
    // Mantém o iframe tempo suficiente para o diálogo de impressão abrir.
    window.setTimeout(cleanup, 120_000)
  }
  document.body.appendChild(iframe)
}
