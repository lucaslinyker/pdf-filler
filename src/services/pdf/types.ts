import type {
  ConditionValue,
  EvolutionValue,
  FinalClassificationValue,
  PcrResultValue,
  RaceValue,
  SerologyResultValue,
  SerologyTypeValue,
  SexValue,
  SymptomValue,
  TestStatusValue,
  TestTypeValue,
} from '../../features/notification/notification.types'

/** Centro normalizado (0–1, origem no canto superior esquerdo) de uma caixa `|__|`. */
export interface CheckPoint {
  x: number
  y: number
}

/** Campo de texto livre. `y` é o centro vertical da linha de texto. */
export interface TextFieldSpec {
  x: number
  y: number
  fontSize: number
  /** Largura disponível (normalizada). O texto é reduzido ou truncado para caber. */
  maxWidth: number
}

/** Campo com um caractere por célula impressa. */
export interface CellsFieldSpec {
  xs: number[]
  y: number
  fontSize: number
}

/** Área de texto com várias linhas (observações). */
export interface MultilineFieldSpec {
  x: number
  /** Linha de base da primeira linha (normalizada). */
  firstBaseline: number
  lineGap: number
  maxLines: number
  fontSize: number
  maxWidth: number
}

type Choice<K extends string> = Record<K, CheckPoint>

export interface TemplateCoordinates {
  identification: {
    notificationNumber: TextFieldSpec
    notificationState: CellsFieldSpec
    notificationCity: TextFieldSpec
    hasCpf: { yes: CheckPoint; no: CheckPoint }
    isForeign: { yes: CheckPoint; no: CheckPoint }
    isHealthProfessional: { yes: CheckPoint; no: CheckPoint }
    isSecurityProfessional: { yes: CheckPoint; no: CheckPoint }
    cbo: TextFieldSpec
    cpf: CellsFieldSpec
    cns: CellsFieldSpec
    fullName: TextFieldSpec
    motherName: TextFieldSpec
    birthDate: CellsFieldSpec
    countryOfOrigin: TextFieldSpec
    sex: Choice<SexValue>
    race: Choice<RaceValue>
    ethnicity: TextFieldSpec
    passport: CellsFieldSpec
    zipCode: CellsFieldSpec
    residenceState: CellsFieldSpec
    residenceCity: TextFieldSpec
    street: TextFieldSpec
    number: TextFieldSpec
    neighborhood: TextFieldSpec
    complement: TextFieldSpec
    mobilePhone: TextFieldSpec
    contactPhone: TextFieldSpec
  }
  clinical: {
    notificationDate: CellsFieldSpec
    symptomStartDate: CellsFieldSpec
    symptoms: Choice<SymptomValue>
    otherSymptoms: TextFieldSpec
    conditions: Choice<ConditionValue>
    testStatus: Choice<TestStatusValue>
    testTypes: Choice<TestTypeValue>
    pcrRapidTestDate: CellsFieldSpec
    serologicalTestDate: CellsFieldSpec
    pcrRapidResult: Choice<PcrResultValue>
    serologyTypes: Choice<SerologyTypeValue>
    serologyResults: Record<SerologyTypeValue, Choice<SerologyResultValue>>
  }
  closure: {
    evolution: Choice<EvolutionValue>
    finalClassification: Choice<FinalClassificationValue>
    closureDate: CellsFieldSpec
    observations: MultilineFieldSpec
  }
}

/** Dimensões da página em pontos PDF. */
export interface PageSize {
  width: number
  height: number
}
