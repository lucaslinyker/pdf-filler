/**
 * Opções dos campos de seleção. Os rótulos reproduzem, sem alteração, os textos
 * impressos na ficha e-SUS Notifica de 05/10/2020.
 */

export interface Option<V extends string = string> {
  readonly value: V
  readonly label: string
}

const opts = <const T extends readonly Option[]>(list: T) => list

export const SEX_OPTIONS = opts([
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
])

export const RACE_OPTIONS = opts([
  { value: 'white', label: 'Branca' },
  { value: 'black', label: 'Preta' },
  { value: 'yellow', label: 'Amarela' },
  { value: 'brown', label: 'Parda' },
  { value: 'indigenous', label: 'Indígena' },
  { value: 'unknown', label: 'Ignorado' },
])

export const SYMPTOM_OPTIONS = opts([
  { value: 'asymptomatic', label: 'Assintomático' },
  { value: 'fever', label: 'Febre' },
  { value: 'sore_throat', label: 'Dor de Garganta' },
  { value: 'dyspnea', label: 'Dispneia' },
  { value: 'cough', label: 'Tosse' },
  { value: 'coryza', label: 'Coriza' },
  { value: 'headache', label: 'Dor de Cabeça' },
  { value: 'taste_disorders', label: 'Distúrbios gustatórios' },
  { value: 'smell_disorders', label: 'Distúrbios olfativos' },
  { value: 'others', label: 'Outros' },
])

export const CONDITION_OPTIONS = opts([
  { value: 'chronic_respiratory', label: 'Doenças respiratórias crônicas descompensadas' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'obesity', label: 'Obesidade' },
  { value: 'chronic_renal', label: 'Doenças renais crônicas em estágio avançado (graus 3, 4 e 5)' },
  { value: 'immunosuppression', label: 'Imunossupressão' },
  {
    value: 'chromosomal_or_immune_fragility',
    label: 'Portador de doenças cromossômicas ou estado de fragilidade imunológica',
  },
  { value: 'pregnant', label: 'Gestante' },
  { value: 'chronic_cardiac', label: 'Doenças cardíacas crônicas' },
  { value: 'postpartum', label: 'Puérpera (até 45 dias do parto)' },
])

export const TEST_STATUS_OPTIONS = opts([
  { value: 'requested', label: 'Solicitado' },
  { value: 'collected', label: 'Coletado' },
  { value: 'concluded', label: 'Concluído' },
  { value: 'not_requested', label: 'Exame Não Solicitado' },
])

export const TEST_TYPE_OPTIONS = opts([
  { value: 'rt_pcr', label: 'RT – PCR' },
  { value: 'rapid_antibody', label: 'Teste rápido – anticorpo' },
  { value: 'rapid_antigen', label: 'Teste rápido – antígeno' },
  { value: 'serological', label: 'Testes sorológico' },
])

export const PCR_RESULT_OPTIONS = opts([
  { value: 'negative', label: 'Negativo' },
  { value: 'positive', label: 'Positivo' },
  { value: 'inconclusive', label: 'Inconclusivo ou Indeterminado' },
])

export const SEROLOGY_TYPE_OPTIONS = opts([
  { value: 'iga', label: 'IgA' },
  { value: 'igg', label: 'IgG' },
  { value: 'igm', label: 'IgM' },
  { value: 'total_antibodies', label: 'Anticorpos Totais' },
])

export const SEROLOGY_RESULT_OPTIONS = opts([
  { value: 'reactive', label: 'Reagente' },
  { value: 'non_reactive', label: 'Não Reagente' },
  { value: 'inconclusive', label: 'Inconclusivo ou Indeterminado' },
])

export const EVOLUTION_OPTIONS = opts([
  { value: 'canceled', label: 'Cancelado' },
  { value: 'ignored', label: 'Ignorado' },
  { value: 'home_treatment', label: 'Em tratamento domiciliar' },
  { value: 'icu', label: 'Internado em UTI' },
  { value: 'hospitalized', label: 'Internado' },
  { value: 'death', label: 'Óbito' },
  { value: 'cured', label: 'Cura' },
])

export const FINAL_CLASSIFICATION_OPTIONS = opts([
  { value: 'discarded', label: 'Descartado' },
  { value: 'clinical_imaging', label: 'Confirmado Clínico Imagem' },
  { value: 'clinical_epidemiological', label: 'Confirmado Clínico-Epidemiológico' },
  { value: 'clinical_criteria', label: 'Confirmado Por Critério Clínico' },
  { value: 'laboratory', label: 'Confirmado Laboratorial' },
  { value: 'unspecified_flu_syndrome', label: 'Síndrome Gripal Não Especificada' },
])

/** Sigla das 27 UFs (campos "UF de notificação" e "Estado de residência"). */
export const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export type OptionValue<T extends readonly Option[]> = T[number]['value']

/** Extrai os valores como tupla — usada para construir os `z.enum`. */
export const valuesOf = <const T extends readonly Option[]>(list: T) =>
  list.map((o) => o.value) as unknown as [OptionValue<T>, ...OptionValue<T>[]]

export const labelOf = (list: readonly Option[], value?: string): string =>
  list.find((o) => o.value === value)?.label ?? ''
