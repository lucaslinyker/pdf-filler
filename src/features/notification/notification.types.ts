import type {
  OptionValue,
  SEX_OPTIONS,
  RACE_OPTIONS,
  SYMPTOM_OPTIONS,
  CONDITION_OPTIONS,
  TEST_STATUS_OPTIONS,
  TEST_TYPE_OPTIONS,
  PCR_RESULT_OPTIONS,
  SEROLOGY_TYPE_OPTIONS,
  SEROLOGY_RESULT_OPTIONS,
  EVOLUTION_OPTIONS,
  FINAL_CLASSIFICATION_OPTIONS,
} from './notification.options'

export type SexValue = OptionValue<typeof SEX_OPTIONS>
export type RaceValue = OptionValue<typeof RACE_OPTIONS>
export type SymptomValue = OptionValue<typeof SYMPTOM_OPTIONS>
export type ConditionValue = OptionValue<typeof CONDITION_OPTIONS>
export type TestStatusValue = OptionValue<typeof TEST_STATUS_OPTIONS>
export type TestTypeValue = OptionValue<typeof TEST_TYPE_OPTIONS>
export type PcrResultValue = OptionValue<typeof PCR_RESULT_OPTIONS>
export type SerologyTypeValue = OptionValue<typeof SEROLOGY_TYPE_OPTIONS>
export type SerologyResultValue = OptionValue<typeof SEROLOGY_RESULT_OPTIONS>
export type EvolutionValue = OptionValue<typeof EVOLUTION_OPTIONS>
export type FinalClassificationValue = OptionValue<typeof FINAL_CLASSIFICATION_OPTIONS>

/**
 * Modelo central do formulário. Todos os campos são opcionais (a ficha original
 * não documenta obrigatoriedade). Datas ficam em ISO `AAAA-MM-DD`; CPF, CNS, CEP
 * e telefones ficam com máscara no estado do formulário.
 */
export interface NotificationForm {
  identification: {
    notificationNumber?: string
    notificationState?: string
    notificationCity?: string

    hasCpf?: boolean
    cpf?: string
    isForeign?: boolean
    isHealthProfessional?: boolean
    isSecurityProfessional?: boolean

    cbo?: string
    cns?: string
    fullName?: string
    motherName?: string
    birthDate?: string
    countryOfOrigin?: string

    sex?: SexValue
    race?: RaceValue
    ethnicity?: string
    passport?: string

    zipCode?: string
    residenceState?: string
    residenceCity?: string
    street?: string
    number?: string
    neighborhood?: string
    complement?: string

    mobilePhone?: string
    contactPhone?: string
  }

  clinical: {
    notificationDate?: string
    symptomStartDate?: string

    symptoms: SymptomValue[]
    otherSymptoms?: string

    conditions: ConditionValue[]

    testStatus?: TestStatusValue
    testTypes: TestTypeValue[]

    pcrRapidTestDate?: string
    serologicalTestDate?: string

    pcrRapidResult?: PcrResultValue

    serologyTypes: SerologyTypeValue[]

    serologyResults: {
      iga?: SerologyResultValue
      igg?: SerologyResultValue
      igm?: SerologyResultValue
      total_antibodies?: SerologyResultValue
    }
  }

  closure: {
    evolution?: EvolutionValue
    finalClassification?: FinalClassificationValue
    closureDate?: string
    observations?: string
  }
}
