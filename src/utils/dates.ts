/** Datas do formulário ficam em ISO `AAAA-MM-DD` (valor de <input type="date">). */

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE_RE.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

/** Divide `AAAA-MM-DD` em dia, mês e ano (strings com zeros à esquerda). */
export const splitIsoDate = (value: string | undefined): [string, string, string] | null => {
  if (!value || !isValidIsoDate(value)) return null
  const [y, m, d] = value.split('-')
  return [d, m, y]
}

/** `AAAA-MM-DD` → `DD/MM/AAAA` (para a tela de revisão). Vazio se inválida. */
export const formatDateBr = (value: string | undefined): string => {
  const parts = splitIsoDate(value)
  return parts ? parts.join('/') : ''
}
