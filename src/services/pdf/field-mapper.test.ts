import { describe, expect, it } from 'vitest'
import { createEmptyForm, createSampleForm } from '../../features/notification/notification.defaults'
import * as opt from '../../features/notification/notification.options'
import { buildDrawOps } from './field-mapper'
import { coordinates } from './templates/covid-2020/coordinates'

const fields = (ops: ReturnType<typeof buildDrawOps>) => ops.map((o) => o.field)

describe('mapeamento dos campos', () => {
  it('formulário vazio não gera nenhuma operação', () => {
    expect(buildDrawOps(createEmptyForm(), coordinates)).toHaveLength(0)
  })

  it('marca X nas opções selecionadas (única e múltipla)', () => {
    const ops = buildDrawOps(createSampleForm(), coordinates)
    const f = fields(ops)
    expect(f).toContain('identification.hasCpf.yes')
    expect(f).toContain('identification.isForeign.no')
    expect(f).toContain('identification.sex.male')
    expect(f).toContain('identification.race.indigenous')
    for (const s of ['fever', 'cough', 'headache', 'smell_disorders', 'others']) {
      expect(f).toContain(`clinical.symptoms.${s}`)
    }
    expect(f).toContain('clinical.pcrRapidResult.positive')
    expect(f).toContain('clinical.serologyResults.iga.reactive')
    expect(f).toContain('clinical.serologyResults.total_antibodies.reactive')
    expect(f).toContain('closure.finalClassification.laboratory')
  })

  it('Sim/Não: apenas a opção escolhida é marcada', () => {
    const form = createEmptyForm()
    form.identification.hasCpf = false
    expect(fields(buildDrawOps(form, coordinates))).toEqual(['identification.hasCpf.no'])
  })

  it('coloca um dígito por célula (CPF → 11 células)', () => {
    const ops = buildDrawOps(createSampleForm(), coordinates)
    const cpf = ops.find((o) => o.field === 'identification.cpf')
    expect(cpf?.kind).toBe('cells')
    if (cpf?.kind === 'cells') expect(cpf.values.join('')).toBe('12345678909')
  })

  it('CNS com 15 dígitos prolonga além das 14 células impressas', () => {
    const cns = buildDrawOps(createSampleForm(), coordinates).find((o) => o.field === 'identification.cns')
    expect(cns?.kind === 'cells' && cns.values).toHaveLength(15)
    expect(cns?.kind === 'cells' && cns.extend).toBe(true)
    expect(coordinates.identification.cns.xs).toHaveLength(14)
  })

  it('datas viram dia / mês / ano em três células', () => {
    const ops = buildDrawOps(createSampleForm(), coordinates)
    const d = ops.find((o) => o.field === 'identification.birthDate')
    expect(d?.kind === 'cells' && d.values).toEqual(['27', '03', '1985'])
  })

  it('data inválida é ignorada', () => {
    const form = createEmptyForm()
    form.identification.birthDate = '31/12/2020'
    expect(buildDrawOps(form, coordinates)).toHaveLength(0)
  })

  it('todas as opções de todos os grupos possuem coordenada mapeada', () => {
    const groups: [readonly { value: string }[], Record<string, unknown>][] = [
      [opt.SEX_OPTIONS, coordinates.identification.sex],
      [opt.RACE_OPTIONS, coordinates.identification.race],
      [opt.SYMPTOM_OPTIONS, coordinates.clinical.symptoms],
      [opt.CONDITION_OPTIONS, coordinates.clinical.conditions],
      [opt.TEST_STATUS_OPTIONS, coordinates.clinical.testStatus],
      [opt.TEST_TYPE_OPTIONS, coordinates.clinical.testTypes],
      [opt.PCR_RESULT_OPTIONS, coordinates.clinical.pcrRapidResult],
      [opt.SEROLOGY_TYPE_OPTIONS, coordinates.clinical.serologyTypes],
      [opt.EVOLUTION_OPTIONS, coordinates.closure.evolution],
      [opt.FINAL_CLASSIFICATION_OPTIONS, coordinates.closure.finalClassification],
    ]
    for (const [list, map] of groups) {
      expect(Object.keys(map).sort()).toEqual(list.map((o) => o.value).sort())
    }
    for (const t of opt.SEROLOGY_TYPE_OPTIONS) {
      const m = coordinates.clinical.serologyResults[t.value]
      expect(Object.keys(m).sort()).toEqual(opt.SEROLOGY_RESULT_OPTIONS.map((o) => o.value).sort())
    }
  })

  it('todas as coordenadas estão dentro da página (0–1)', () => {
    const check = (node: unknown, path: string) => {
      if (typeof node === 'number') {
        expect(node, path).toBeGreaterThanOrEqual(0)
        expect(node, path).toBeLessThanOrEqual(1)
      } else if (Array.isArray(node)) node.forEach((n, i) => check(n, `${path}[${i}]`))
      else if (node && typeof node === 'object')
        for (const [k, v] of Object.entries(node)) if (k !== 'fontSize' && k !== 'maxLines') check(v, `${path}.${k}`)
    }
    check(coordinates, 'coordinates')
  })
})
