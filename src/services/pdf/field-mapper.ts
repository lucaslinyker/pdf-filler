import { splitIsoDate } from '../../utils/dates'
import { onlyDigits } from '../../utils/masks'
import type { NotificationForm } from '../../features/notification/notification.types'
import { toMultiLine, toSingleLine } from './text-layout'
import type {
  CellsFieldSpec,
  CheckPoint,
  MultilineFieldSpec,
  TemplateCoordinates,
  TextFieldSpec,
} from './types'

/**
 * Operações de desenho independentes de biblioteca: o mapeador transforma os
 * dados do formulário + o mapa de coordenadas em uma lista de operações, e o
 * gerador as aplica sobre o PDF. Isso permite testar o mapeamento sem PDF.
 */
export type DrawOp =
  | { kind: 'text'; field: string; text: string; spec: TextFieldSpec }
  | { kind: 'cells'; field: string; values: string[]; spec: CellsFieldSpec; extend: boolean }
  | { kind: 'check'; field: string; point: CheckPoint }
  | { kind: 'multiline'; field: string; text: string; spec: MultilineFieldSpec }

export const buildDrawOps = (form: NotificationForm, c: TemplateCoordinates): DrawOp[] => {
  const ops: DrawOp[] = []
  const { identification: id, clinical: cl, closure: cs } = form

  const text = (field: string, value: string | undefined, spec: TextFieldSpec) => {
    const t = toSingleLine(value ?? '')
    if (t) ops.push({ kind: 'text', field, text: t, spec })
  }
  /** Um caractere por célula. `max` limita a quantidade; `extend` permite exceder as células impressas. */
  const chars = (
    field: string,
    value: string,
    spec: CellsFieldSpec,
    { max, extend = false }: { max?: number; extend?: boolean } = {},
  ) => {
    const list = Array.from(value).slice(0, max ?? (extend ? value.length : spec.xs.length))
    if (list.length) ops.push({ kind: 'cells', field, values: list, spec, extend })
  }
  const date = (field: string, value: string | undefined, spec: CellsFieldSpec) => {
    const parts = splitIsoDate(value)
    if (parts) ops.push({ kind: 'cells', field, values: [...parts], spec, extend: false })
  }
  const check = (field: string, point: CheckPoint | undefined) => {
    if (point) ops.push({ kind: 'check', field, point })
  }
  const yesNo = (
    field: string,
    value: boolean | undefined,
    points: { yes: CheckPoint; no: CheckPoint },
  ) => {
    if (value === true) check(`${field}.yes`, points.yes)
    else if (value === false) check(`${field}.no`, points.no)
  }
  const single = <K extends string>(
    field: string,
    value: K | undefined,
    points: Record<K, CheckPoint>,
  ) => {
    if (value && value in points) check(`${field}.${value}`, points[value])
  }
  const multi = <K extends string>(field: string, values: K[], points: Record<K, CheckPoint>) => {
    for (const v of values) if (v in points) check(`${field}.${v}`, points[v])
  }

  // ── Identificação ─────────────────────────────────────────────────────────
  const i = c.identification
  text('identification.notificationNumber', id.notificationNumber, i.notificationNumber)
  chars('identification.notificationState', (id.notificationState ?? '').toUpperCase(), i.notificationState)
  text('identification.notificationCity', id.notificationCity, i.notificationCity)
  yesNo('identification.hasCpf', id.hasCpf, i.hasCpf)
  yesNo('identification.isForeign', id.isForeign, i.isForeign)
  yesNo('identification.isHealthProfessional', id.isHealthProfessional, i.isHealthProfessional)
  yesNo('identification.isSecurityProfessional', id.isSecurityProfessional, i.isSecurityProfessional)
  text('identification.cbo', id.cbo, i.cbo)
  chars('identification.cpf', onlyDigits(id.cpf), i.cpf)
  // CNS: 15 dígitos; a ficha tem 14 células → o 15º dígito segue além da última célula
  chars('identification.cns', onlyDigits(id.cns), i.cns, { max: 15, extend: true })
  text('identification.fullName', id.fullName, i.fullName)
  text('identification.motherName', id.motherName, i.motherName)
  date('identification.birthDate', id.birthDate, i.birthDate)
  text('identification.countryOfOrigin', id.countryOfOrigin, i.countryOfOrigin)
  single('identification.sex', id.sex, i.sex)
  single('identification.race', id.race, i.race)
  text('identification.ethnicity', id.ethnicity, i.ethnicity)
  chars('identification.passport', (id.passport ?? '').toUpperCase(), i.passport)
  chars('identification.zipCode', onlyDigits(id.zipCode), i.zipCode)
  chars('identification.residenceState', (id.residenceState ?? '').toUpperCase(), i.residenceState)
  text('identification.residenceCity', id.residenceCity, i.residenceCity)
  text('identification.street', id.street, i.street)
  text('identification.number', id.number, i.number)
  text('identification.neighborhood', id.neighborhood, i.neighborhood)
  text('identification.complement', id.complement, i.complement)
  text('identification.mobilePhone', id.mobilePhone, i.mobilePhone)
  text('identification.contactPhone', id.contactPhone, i.contactPhone)

  // ── Dados clínicos epidemiológicos ───────────────────────────────────────
  const k = c.clinical
  date('clinical.notificationDate', cl.notificationDate, k.notificationDate)
  date('clinical.symptomStartDate', cl.symptomStartDate, k.symptomStartDate)
  multi('clinical.symptoms', cl.symptoms, k.symptoms)
  text('clinical.otherSymptoms', cl.otherSymptoms, k.otherSymptoms)
  multi('clinical.conditions', cl.conditions, k.conditions)
  single('clinical.testStatus', cl.testStatus, k.testStatus)
  multi('clinical.testTypes', cl.testTypes, k.testTypes)
  date('clinical.pcrRapidTestDate', cl.pcrRapidTestDate, k.pcrRapidTestDate)
  date('clinical.serologicalTestDate', cl.serologicalTestDate, k.serologicalTestDate)
  single('clinical.pcrRapidResult', cl.pcrRapidResult, k.pcrRapidResult)
  multi('clinical.serologyTypes', cl.serologyTypes, k.serologyTypes)
  for (const type of ['iga', 'igg', 'igm', 'total_antibodies'] as const) {
    single(`clinical.serologyResults.${type}`, cl.serologyResults[type], k.serologyResults[type])
  }

  // ── Encerramento ─────────────────────────────────────────────────────────
  const e = c.closure
  single('closure.evolution', cs.evolution, e.evolution)
  single('closure.finalClassification', cs.finalClassification, e.finalClassification)
  date('closure.closureDate', cs.closureDate, e.closureDate)
  const obs = toMultiLine(cs.observations ?? '')
  if (obs) ops.push({ kind: 'multiline', field: 'closure.observations', text: obs, spec: e.observations })

  return ops
}
