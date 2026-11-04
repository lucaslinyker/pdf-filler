import { describe, expect, it } from 'vitest'
import { maskCep, maskCns, maskCpf, maskPhone, onlyDigits } from '../../utils/masks'
import { createEmptyForm, createSampleForm } from './notification.defaults'
import { notificationSchema } from './notification.schema'
import * as options from './notification.options'

describe('validação (Zod)', () => {
  it('aceita o formulário vazio (todos os campos são opcionais)', () => {
    expect(notificationSchema.safeParse(createEmptyForm()).success).toBe(true)
  })

  it('aceita o formulário de exemplo (dados fictícios)', () => {
    const r = notificationSchema.safeParse(createSampleForm())
    expect(r.success).toBe(true)
  })

  it('valida o formato de CPF, CNS, CEP, telefone e datas quando preenchidos', () => {
    const bad = createSampleForm()
    bad.identification.cpf = '123.456'
    bad.identification.cns = '123'
    bad.identification.zipCode = '123'
    bad.identification.mobilePhone = '(17) 123'
    bad.identification.birthDate = '2026-02-31'
    const r = notificationSchema.safeParse(bad)
    expect(r.success).toBe(false)
    if (!r.success) {
      const paths = r.error.issues.map((i) => i.path.join('.'))
      expect(paths).toEqual(
        expect.arrayContaining([
          'identification.cpf',
          'identification.cns',
          'identification.zipCode',
          'identification.mobilePhone',
          'identification.birthDate',
        ]),
      )
    }
  })

  it('rejeita UF inexistente e valor fora da lista de opções', () => {
    const bad = createSampleForm()
    bad.identification.notificationState = 'XX'
    expect(notificationSchema.safeParse(bad).success).toBe(false)
    const bad2 = JSON.parse(JSON.stringify(createSampleForm()))
    bad2.closure.evolution = 'inventado'
    expect(notificationSchema.safeParse(bad2).success).toBe(false)
  })

  it('campos de seleção múltipla são arrays', () => {
    const r = notificationSchema.parse(createSampleForm())
    expect(Array.isArray(r.clinical.symptoms)).toBe(true)
    expect(Array.isArray(r.clinical.conditions)).toBe(true)
  })
})

describe('máscaras', () => {
  it('CPF, CNS, CEP e telefone', () => {
    expect(maskCpf('12345678909')).toBe('123.456.789-09')
    expect(maskCns('123456789012345')).toBe('123 4567 8901 2345')
    expect(maskCep('15800000')).toBe('15800-000')
    expect(maskPhone('17999990000')).toBe('(17) 99999-0000')
    expect(maskPhone('1733330000')).toBe('(17) 3333-0000')
    expect(onlyDigits('(17) 9-9999')).toBe('1799999')
  })
})

describe('opções espelham o PDF original', () => {
  it('quantidade de opções por grupo', () => {
    expect(options.SYMPTOM_OPTIONS).toHaveLength(10)
    expect(options.CONDITION_OPTIONS).toHaveLength(9)
    expect(options.RACE_OPTIONS).toHaveLength(6)
    expect(options.EVOLUTION_OPTIONS).toHaveLength(7)
    expect(options.FINAL_CLASSIFICATION_OPTIONS).toHaveLength(6)
    expect(options.TEST_STATUS_OPTIONS).toHaveLength(4)
    expect(options.TEST_TYPE_OPTIONS).toHaveLength(4)
  })
})
