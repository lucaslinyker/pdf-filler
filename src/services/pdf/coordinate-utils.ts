import type { PageSize } from './types'

/**
 * Metade da altura das maiúsculas, como fração do tamanho da fonte.
 * O mapeamento guarda o CENTRO vertical do texto; o engine usa esta constante
 * para obter a linha de base (e o mapeamento, para fazer a conta inversa).
 */
export const CAP_HALF = 0.365

export interface MediaBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Converte coordenada normalizada (0–1, origem no canto SUPERIOR esquerdo)
 * em ponto PDF (origem no canto INFERIOR esquerdo).
 */
export const toPdfPoint = (nx: number, ny: number, box: MediaBox): { x: number; y: number } => ({
  x: box.x + nx * box.width,
  y: box.y + box.height - ny * box.height,
})

/** Converte uma largura/altura normalizada em pontos. */
export const toPoints = (n: number, size: PageSize, axis: 'x' | 'y'): number =>
  n * (axis === 'x' ? size.width : size.height)

/**
 * Linha de base (em pontos PDF) de um texto cujo centro vertical está em
 * `centerPdfY`. No PDF o eixo Y cresce para cima, então a base fica ABAIXO do centro.
 */
export const baselineFromCenter = (centerPdfY: number, fontSize: number): number =>
  centerPdfY - CAP_HALF * fontSize
