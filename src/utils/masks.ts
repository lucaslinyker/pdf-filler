/** Máscaras e normalizadores de texto. Funções puras, sem dependências. */

export const onlyDigits = (value: string | undefined | null): string =>
  (value ?? '').replace(/\D/g, '')

export const maskCpf = (value: string): string => {
  const d = onlyDigits(value).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

/** CNS: 15 dígitos, agrupados 3-4-4-4 (ex.: 123 4567 8901 2345). */
export const maskCns = (value: string): string => {
  const d = onlyDigits(value).slice(0, 15)
  return [d.slice(0, 3), d.slice(3, 7), d.slice(7, 11), d.slice(11, 15)].filter(Boolean).join(' ')
}

export const maskCep = (value: string): string => {
  const d = onlyDigits(value).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

/** Telefone BR: (DD) 9999-9999 ou (DD) 99999-9999. */
export const maskPhone = (value: string): string => {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Passaporte: letras e números maiúsculos, até 8 caracteres (8 células na ficha). */
export const normalizePassport = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)

export const normalizeUf = (value: string): string =>
  value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2)

/** Número da notificação: somente caracteres alfanuméricos, '-' e '/'. */
export const normalizeNotificationNumber = (value: string): string =>
  value.replace(/[^a-zA-Z0-9/-]/g, '').slice(0, 20)
