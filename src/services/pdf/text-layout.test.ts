import { describe, expect, it } from 'vitest'
import { fitMultiline, fitSingleLine, toSingleLine, wrapText, type Measure } from './text-layout'

// Medida fictícia: cada caractere ocupa 0,5 × tamanho da fonte.
const measure: Measure = (text, size) => Array.from(text).length * size * 0.5

describe('tratamento de textos extensos', () => {
  it('mantém o texto que cabe', () => {
    const r = fitSingleLine(measure, 'abc', 10, 100)
    expect(r).toEqual({ text: 'abc', fontSize: 10, shrunk: false, truncated: false })
  })

  it('reduz a fonte antes de truncar', () => {
    const r = fitSingleLine(measure, 'x'.repeat(24), 10, 100) // 120 > 100 → reduz
    expect(r.shrunk).toBe(true)
    expect(r.truncated).toBe(false)
    expect(measure(r.text, r.fontSize)).toBeLessThanOrEqual(100)
  })

  it('trunca com reticências quando nem a fonte mínima resolve', () => {
    const r = fitSingleLine(measure, 'x'.repeat(100), 10, 60, 6)
    expect(r.truncated).toBe(true)
    expect(r.text.endsWith('…')).toBe(true)
    expect(measure(r.text, r.fontSize)).toBeLessThanOrEqual(60)
  })

  it('quebra linhas respeitando a largura e o \\n', () => {
    const lines = wrapText(measure, 'um dois três\nquatro', 10, 60) // 12 caracteres por linha
    for (const l of lines) expect(measure(l, 10)).toBeLessThanOrEqual(60)
    expect(lines.join(' ')).toContain('quatro')
  })

  it('quebra palavras maiores que a linha', () => {
    const lines = wrapText(measure, 'a'.repeat(30), 10, 50)
    expect(lines.length).toBeGreaterThan(1)
    for (const l of lines) expect(measure(l, 10)).toBeLessThanOrEqual(50)
  })

  it('limita observações ao número de linhas da ficha', () => {
    const fit = fitMultiline(measure, 'palavra '.repeat(80), 8, 200, 2, 6)
    expect(fit.lines).toHaveLength(2)
    expect(fit.truncated).toBe(true)
    expect(fit.lines[1].endsWith('…')).toBe(true)
  })

  it('observação curta não é alterada', () => {
    const fit = fitMultiline(measure, 'Texto curto', 8, 200, 2)
    expect(fit).toEqual({ lines: ['Texto curto'], fontSize: 8, shrunk: false, truncated: false })
  })

  it('normaliza para uma linha', () => {
    expect(toSingleLine('  a\n\tb   c ')).toBe('a b c')
  })
})
