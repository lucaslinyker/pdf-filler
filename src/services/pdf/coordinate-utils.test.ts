import { describe, expect, it } from 'vitest'
import { CAP_HALF, baselineFromCenter, toPdfPoint, toPoints } from './coordinate-utils'

const A4 = { x: 0, y: 0, width: 595.32, height: 841.92 }

describe('conversão de coordenadas', () => {
  it('converte origem no canto superior esquerdo para inferior esquerdo', () => {
    expect(toPdfPoint(0, 0, A4)).toEqual({ x: 0, y: 841.92 })
    expect(toPdfPoint(1, 1, A4).x).toBeCloseTo(595.32)
    expect(toPdfPoint(1, 1, A4).y).toBeCloseTo(0)
    const mid = toPdfPoint(0.5, 0.5, A4)
    expect(mid.x).toBeCloseTo(297.66)
    expect(mid.y).toBeCloseTo(420.96)
  })

  it('respeita deslocamento do MediaBox', () => {
    const p = toPdfPoint(0, 0, { x: 10, y: 20, width: 100, height: 200 })
    expect(p).toEqual({ x: 10, y: 220 })
  })

  it('converte larguras normalizadas em pontos', () => {
    expect(toPoints(0.5, A4, 'x')).toBeCloseTo(297.66)
    expect(toPoints(0.5, A4, 'y')).toBeCloseTo(420.96)
  })

  it('a linha de base fica abaixo do centro, proporcional à fonte', () => {
    expect(baselineFromCenter(500, 10)).toBeCloseTo(500 - CAP_HALF * 10)
    expect(baselineFromCenter(500, 10)).toBeLessThan(500)
  })
})
