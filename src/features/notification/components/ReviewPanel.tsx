import { Button } from '../../../components/ui/Button'
import { Section } from '../../../components/ui/Section'
import type { GenerationWarning } from '../../../services/pdf/pdf-generator'
import { formatDateBr } from '../../../utils/dates'
import {
  CONDITION_OPTIONS,
  EVOLUTION_OPTIONS,
  FINAL_CLASSIFICATION_OPTIONS,
  PCR_RESULT_OPTIONS,
  RACE_OPTIONS,
  SEROLOGY_RESULT_OPTIONS,
  SEROLOGY_TYPE_OPTIONS,
  SEX_OPTIONS,
  SYMPTOM_OPTIONS,
  TEST_STATUS_OPTIONS,
  TEST_TYPE_OPTIONS,
  labelOf,
  type Option,
} from '../notification.options'
import type { NotificationForm } from '../notification.types'

type Row = [label: string, value: string]

const yesNo = (v: boolean | undefined) => (v === undefined ? '' : v ? 'Sim' : 'Não')
const many = (list: readonly Option[], values: string[]) => values.map((v) => labelOf(list, v)).join(', ')

const buildRows = (f: NotificationForm): Record<'id' | 'clinical' | 'closure', Row[]> => {
  const i = f.identification
  const c = f.clinical
  const e = f.closure
  const address = [i.street, i.number, i.neighborhood, i.complement].filter(Boolean).join(', ')
  return {
    id: [
      ['Nº da notificação', i.notificationNumber ?? ''],
      ['UF / Município de notificação', [i.notificationState, i.notificationCity].filter(Boolean).join(' · ')],
      ['Tem CPF?', yesNo(i.hasCpf)],
      ['CPF', i.cpf ?? ''],
      ['Estrangeiro?', yesNo(i.isForeign)],
      ['Profissional de saúde?', yesNo(i.isHealthProfessional)],
      ['CBO', i.cbo ?? ''],
      ['Profissional de segurança?', yesNo(i.isSecurityProfessional)],
      ['CNS', i.cns ?? ''],
      ['Nome completo', i.fullName ?? ''],
      ['Nome da mãe', i.motherName ?? ''],
      ['Data de nascimento', formatDateBr(i.birthDate)],
      ['País de origem', i.countryOfOrigin ?? ''],
      ['Passaporte', i.passport ?? ''],
      ['Sexo', labelOf(SEX_OPTIONS, i.sex)],
      ['Raça/Cor', [labelOf(RACE_OPTIONS, i.race), i.ethnicity && `Etnia: ${i.ethnicity}`].filter(Boolean).join(' · ')],
      ['CEP', i.zipCode ?? ''],
      ['Estado / Município de residência', [i.residenceState, i.residenceCity].filter(Boolean).join(' · ')],
      ['Endereço', address],
      ['Telefone celular', i.mobilePhone ?? ''],
      ['Telefone de contato', i.contactPhone ?? ''],
    ],
    clinical: [
      ['Data da notificação', formatDateBr(c.notificationDate)],
      ['Início dos sintomas', formatDateBr(c.symptomStartDate)],
      ['Sintomas', [many(SYMPTOM_OPTIONS, c.symptoms), c.otherSymptoms && `(${c.otherSymptoms})`].filter(Boolean).join(' ')],
      ['Condições', many(CONDITION_OPTIONS, c.conditions)],
      ['Estado do teste', labelOf(TEST_STATUS_OPTIONS, c.testStatus)],
      ['Tipo de teste', many(TEST_TYPE_OPTIONS, c.testTypes)],
      ['Data do teste (PCR/Rápidos)', formatDateBr(c.pcrRapidTestDate)],
      ['Data do teste (Sorológico)', formatDateBr(c.serologicalTestDate)],
      ['Resultado (PCR/Rápidos)', labelOf(PCR_RESULT_OPTIONS, c.pcrRapidResult)],
      ['Teste sorológico', many(SEROLOGY_TYPE_OPTIONS, c.serologyTypes)],
      ...SEROLOGY_TYPE_OPTIONS.map(
        (o): Row => [`Resultado (${o.label})`, labelOf(SEROLOGY_RESULT_OPTIONS, c.serologyResults[o.value])],
      ),
    ],
    closure: [
      ['Evolução do caso', labelOf(EVOLUTION_OPTIONS, e.evolution)],
      ['Classificação final', labelOf(FINAL_CLASSIFICATION_OPTIONS, e.finalClassification)],
      ['Data de encerramento', formatDateBr(e.closureDate)],
      ['Observações', e.observations ?? ''],
    ],
  }
}

function Rows({ rows }: { rows: Row[] }) {
  const filled = rows.filter(([, v]) => v.trim() !== '')
  if (filled.length === 0) return <p className="text-sm text-slate-500">Nenhum campo preenchido nesta seção.</p>
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,13rem)_1fr]">
      {filled.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-xs font-medium text-slate-500 sm:pt-0.5">{label}</dt>
          <dd className="whitespace-pre-wrap break-words text-sm text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

interface ReviewPanelProps {
  values: NotificationForm
  generating: boolean
  hasResult: boolean
  stale: boolean
  warnings: GenerationWarning[]
  error: string | null
  onEditStep: (step: number) => void
  onGenerate: () => void
  onDownload: () => void
  onPrint: () => void
  onClear: () => void
}

const FIELD_LABELS: Record<string, string> = {
  'identification.notificationNumber': 'Número da notificação',
  'identification.notificationCity': 'Município de notificação',
  'identification.cbo': 'CBO',
  'identification.fullName': 'Nome completo',
  'identification.motherName': 'Nome da mãe',
  'identification.countryOfOrigin': 'País de origem',
  'identification.ethnicity': 'Etnia',
  'identification.residenceCity': 'Município de residência',
  'identification.street': 'Logradouro',
  'identification.number': 'Número',
  'identification.neighborhood': 'Bairro',
  'identification.complement': 'Complemento',
  'identification.mobilePhone': 'Telefone celular',
  'identification.contactPhone': 'Telefone de contato',
  'clinical.otherSymptoms': 'Outros sintomas',
  'closure.observations': 'Observações',
}

export function ReviewPanel(props: ReviewPanelProps) {
  const rows = buildRows(props.values)
  const truncated = props.warnings.filter((w) => w.type === 'truncated')
  const shrunk = props.warnings.filter((w) => w.type === 'shrunk')
  const name = (w: GenerationWarning) => FIELD_LABELS[w.field] ?? w.field

  return (
    <div className="space-y-5">
      <Section title="1 · Identificação" description="Confira os dados antes de gerar o PDF.">
        <Rows rows={rows.id} />
        <Button className="px-3 py-1 text-xs" onClick={() => props.onEditStep(0)}>Editar</Button>
      </Section>
      <Section title="2 · Dados clínicos epidemiológicos">
        <Rows rows={rows.clinical} />
        <Button className="px-3 py-1 text-xs" onClick={() => props.onEditStep(1)}>Editar</Button>
      </Section>
      <Section title="3 · Encerramento">
        <Rows rows={rows.closure} />
        <Button className="px-3 py-1 text-xs" onClick={() => props.onEditStep(2)}>Editar</Button>
      </Section>

      {props.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {props.error}
        </p>
      )}
      {truncated.length > 0 && (
        <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Texto cortado no PDF por não caber no espaço da ficha: <strong>{truncated.map(name).join(', ')}</strong>. Abrevie o
          conteúdo e gere novamente.
        </p>
      )}
      {shrunk.length > 0 && (
        <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Fonte reduzida para caber: {shrunk.map(name).join(', ')}.
        </p>
      )}
      {props.hasResult && props.stale && (
        <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          O formulário foi alterado depois da última geração. Gere o PDF novamente.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={props.onGenerate} disabled={props.generating}>
          {props.generating ? 'Gerando…' : props.hasResult ? 'Gerar PDF novamente' : 'Gerar PDF'}
        </Button>
        <Button onClick={props.onDownload} disabled={!props.hasResult}>
          Baixar PDF
        </Button>
        <Button onClick={props.onPrint} disabled={!props.hasResult}>
          Imprimir
        </Button>
        <Button variant="danger" onClick={props.onClear} className="ml-auto">
          Limpar e iniciar novo preenchimento
        </Button>
      </div>
    </div>
  )
}
