/**
 * Mapeamento de coordenadas do template `covid-2020` (e-SUS Notifica, 05/10/2020).
 *
 * As medidas foram extraídas do próprio PDF (posição real de rótulos, células de
 * dígitos `__|__` e caixas `|__|`), em pontos PDF com origem no CANTO SUPERIOR
 * ESQUERDO da página (A4: 595,32 × 841,92 pt). As funções auxiliares abaixo
 * convertem esses pontos em coordenadas NORMALIZADAS (0–1), que é o que o
 * PDF Engine consome.
 *
 * Convenções:
 *  - Campo de texto: `x` = início do texto, `y` = CENTRO VERTICAL da linha de texto.
 *    O engine calcula a linha de base a partir do centro e do tamanho da fonte.
 *  - Campo em células: um dígito/caractere centralizado em cada célula impressa.
 *  - Caixa de seleção: `x`,`y` = centro da caixa `|__|`; o X é desenhado centralizado.
 *
 * Para ajustar o alinhamento basta editar este arquivo (ou usar o modo de calibração).
 */
import { CAP_HALF } from '../../coordinate-utils'
import type { TemplateCoordinates } from '../../types'

export const PAGE = { width: 595.32, height: 841.92 } as const

const nx = (v: number) => v / PAGE.width
const ny = (v: number) => v / PAGE.height

/** Caixa de seleção: centro em pontos (origem no canto superior esquerdo). */
const cb = (x: number, y: number) => ({ x: nx(x), y: ny(y) })

/**
 * Campo de texto livre.
 * `baseline` = linha de base do rótulo impresso ao lado (pt, a partir do topo).
 * `maxWidth` = largura disponível em pontos até a borda da célula.
 */
const text = (x: number, baseline: number, maxWidth: number, fontSize = 9, lift = 0.8) => ({
  x: nx(x),
  y: ny(baseline - CAP_HALF * fontSize - lift),
  fontSize,
  maxWidth: nx(maxWidth),
})

/** Campo em células (um caractere por célula). `centers` = centros x em pontos. */
const cells = (centers: number[], baseline: number, fontSize = 9, lift = 1.2) => ({
  xs: centers.map(nx),
  y: ny(baseline - CAP_HALF * fontSize - lift),
  fontSize,
})

/** Data dd | mm | aaaa em três células. */
const dateCells = (centers: [number, number, number], baseline: number, fontSize = 8) =>
  cells(centers, baseline, fontSize)

export const coordinates: TemplateCoordinates = {
  identification: {
    // Cabeçalho: caixa cinza com o rótulo "Nº" (x 410,9–573,9 · y 49,2–69,0)
    notificationNumber: text(433, 62.8, 134),
    // "|__|__|" sob "UF de notificação:"
    notificationState: cells([59.0, 75.1], 172.0),
    notificationCity: text(145, 172.0, 128),
    hasCpf: { yes: cb(78.6, 199.2), no: cb(118.0, 199.2) },
    isForeign: { yes: cb(170.8, 199.2), no: cb(212.6, 199.2) },
    isHealthProfessional: { yes: cb(277.1, 196.2), no: cb(319.0, 196.2) },
    isSecurityProfessional: { yes: cb(426.0, 199.2), no: cb(467.8, 199.2) },
    cbo: text(94, 219.3, 228),
    cpf: cells([362.4, 378.4, 394.5, 410.4, 426.5, 442.5, 458.4, 474.5, 490.5, 506.5, 522.6], 219.3),
    // O formulário impresso tem 14 células, mas o CNS real tem 15 dígitos:
    // o 15º dígito segue o mesmo passo, logo após a última célula impressa.
    cns: cells([97.4, 113.4, 129.5, 145.4, 161.5, 177.5, 193.4, 209.5, 225.5, 241.5, 257.6, 273.6, 289.6, 305.6], 236.2),
    fullName: text(150, 253.1, 420),
    motherName: text(187, 270.0, 383),
    birthDate: dateCells([178.3, 205.2, 240.5], 287.0),
    countryOfOrigin: text(406, 287.0, 164),
    sex: { male: cb(78.6, 311.2), female: cb(78.6, 324.8) },
    race: {
      white: cb(209.6, 311.2), black: cb(264.1, 311.2), yellow: cb(311.5, 311.2), brown: cb(375.2, 311.2),
      indigenous: cb(209.6, 324.8), unknown: cb(374.5, 324.8),
    },
    // Sublinhado "Etnia:_____________" (x 292,6–363,8)
    ethnicity: text(294, 327.8, 70, 8),
    passport: cells([451.1, 467.2, 483.2, 499.3, 515.3, 531.3, 547.3, 563.3], 314.3),
    zipCode: cells([96.2, 112.2, 128.2, 144.3, 160.3, 179.5, 195.6, 211.7], 341.7),
    residenceState: cells([178.1, 194.0], 355.6),
    // Sublinhado "Município de Residência:" (x 351,7–510,5)
    residenceCity: text(353, 355.6, 156),
    street: text(128, 369.5, 222),
    number: text(405, 369.5, 33, 8),
    neighborhood: text(480, 369.5, 90),
    complement: text(140, 383.4, 430),
    mobilePhone: text(150, 397.4, 172),
    contactPhone: text(431, 397.4, 140),
  },
  clinical: {
    notificationDate: dateCells([171.6, 193.1, 217.4], 411.3),
    symptomStartDate: dateCells([471.5, 493.0, 517.3], 411.3),
    symptoms: {
      asymptomatic: cb(77.6, 435.1), fever: cb(161.2, 435.1), sore_throat: cb(226.3, 435.1),
      dyspnea: cb(335.2, 435.1), cough: cb(412.2, 435.1), coryza: cb(476.8, 435.1),
      headache: cb(77.6, 447.4), taste_disorders: cb(160.3, 447.4), smell_disorders: cb(270.6, 447.4),
      others: cb(374.9, 447.4),
    },
    // Sublinhado "Outros_____________________________" (x 412,4–556,7)
    otherSymptoms: text(414, 450.0, 142, 8),
    conditions: {
      chronic_respiratory: cb(77.6, 473.6), diabetes: cb(403.5, 473.6), obesity: cb(508.1, 473.6),
      chronic_renal: cb(77.6, 485.9), immunosuppression: cb(403.2, 485.9),
      chromosomal_or_immune_fragility: cb(77.6, 498.1), pregnant: cb(403.1, 498.1),
      chronic_cardiac: cb(77.6, 510.4), postpartum: cb(403.9, 510.4),
    },
    testStatus: {
      requested: cb(77.6, 536.4), collected: cb(77.6, 548.6), concluded: cb(77.6, 560.9), not_requested: cb(77.6, 573.1),
    },
    testTypes: {
      rt_pcr: cb(205.2, 536.4), rapid_antibody: cb(205.2, 548.6), rapid_antigen: cb(205.2, 560.9), serological: cb(205.2, 573.1),
    },
    pcrRapidTestDate: dateCells([338.6, 360.1, 381.6], 563.6),
    serologicalTestDate: dateCells([430.7, 452.4, 476.8], 557.5),
    pcrRapidResult: { negative: cb(77.6, 604.9), positive: cb(77.6, 617.1), inconclusive: cb(77.6, 629.4) },
    serologyTypes: { iga: cb(262.0, 599.1), igg: cb(262.0, 611.4), igm: cb(262.0, 623.6), total_antibodies: cb(262.0, 635.9) },
    serologyResults: {
      iga: { reactive: cb(432.0, 604.9), non_reactive: cb(432.0, 617.1), inconclusive: cb(432.0, 629.4) },
      igg: { reactive: cb(77.6, 666.1), non_reactive: cb(77.6, 678.4), inconclusive: cb(77.6, 690.6) },
      igm: { reactive: cb(262.0, 666.1), non_reactive: cb(262.0, 678.4), inconclusive: cb(262.0, 690.6) },
      total_antibodies: { reactive: cb(432.0, 671.1), non_reactive: cb(432.0, 683.1), inconclusive: cb(432.0, 695.4) },
    },
  },
  closure: {
    evolution: {
      canceled: cb(76.7, 731.1), ignored: cb(76.7, 742.4), hospitalized: cb(191.9, 742.4),
      home_treatment: cb(76.7, 753.1), death: cb(191.7, 753.1), icu: cb(76.7, 764.1), cured: cb(192.8, 764.1),
    },
    finalClassification: {
      discarded: cb(261.0, 719.6), clinical_imaging: cb(261.0, 730.6), clinical_epidemiological: cb(261.0, 741.6),
      clinical_criteria: cb(261.0, 752.6), laboratory: cb(261.0, 763.6), unspecified_flu_syndrome: cb(261.0, 774.6),
    },
    closureDate: dateCells([501.5, 528.5, 552.7], 750.7),
    // Faixa "Informações complementares e observações": 2 linhas pautadas
    // (y 793,2–807,1 e 807,1–821,1), x 45–572.
    observations: {
      x: nx(46),
      firstBaseline: ny(804.1),
      lineGap: ny(13.95),
      maxLines: 2,
      fontSize: 8,
      maxWidth: nx(524),
    },
  },
}
