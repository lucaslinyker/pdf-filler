export const TEMPLATE_PATH = 'templates/covid-2020/template.pdf'

export const loadTemplateBytes = async (): Promise<ArrayBuffer> => {
  const url = `${import.meta.env?.BASE_URL ?? '/'}${TEMPLATE_PATH}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Não foi possível carregar o modelo do PDF (${res.status})`)
  }

  return res.arrayBuffer()
}
