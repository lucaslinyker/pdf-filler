import { z } from 'zod'
import { isValidIsoDate } from '../../utils/dates'
import { onlyDigits } from '../../utils/masks'
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
  UF_LIST,
  valuesOf,
} from './notification.options'
import type { NotificationForm } from './notification.types'

/**
 * Todos os campos são opcionais (a ficha não documenta obrigatoriedade).
 * As validações abaixo cuidam apenas do FORMATO, quando o campo foi preenchido.
 */

const text = (max: number) => z.string().max(max, `Máximo de ${max} caracteres`).optional()

/** Campo numérico com máscara: valida somente a quantidade de dígitos. */
const digits = (exact: number, label: string) =>
  z
    .string()
    .optional()
    .refine((v) => !v || onlyDigits(v).length === exact, `${label} deve ter ${exact} dígitos`)

const isoDate = z
  .string()
  .optional()
  .refine((v) => !v || isValidIsoDate(v), 'Data inválida')

const uf = z
  .string()
  .optional()
  .refine((v) => !v || (UF_LIST as readonly string[]).includes(v), 'UF inválida')

/** Aceita valor da lista ou vazio (campo ainda não escolhido). */
const choice = <T extends [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.literal('')]).optional().transform((v) => (v === '' ? undefined : v))

export const notificationSchema = z.object({
  identification: z.object({
    notificationNumber: text(20),
    notificationState: uf,
    notificationCity: text(60),

    hasCpf: z.boolean().optional(),
    cpf: digits(11, 'CPF'),
    isForeign: z.boolean().optional(),
    isHealthProfessional: z.boolean().optional(),
    isSecurityProfessional: z.boolean().optional(),

    cbo: text(40),
    // O CNS tem 15 dígitos (a ficha impressa possui 14 células — ver coordinates.ts)
    cns: digits(15, 'CNS'),
    fullName: text(120),
    motherName: text(120),
    birthDate: isoDate,
    countryOfOrigin: text(40),

    sex: choice(valuesOf(SEX_OPTIONS)),
    race: choice(valuesOf(RACE_OPTIONS)),
    ethnicity: text(30),
    passport: z
      .string()
      .optional()
      .refine((v) => !v || /^[A-Za-z0-9]{1,8}$/.test(v), 'Passaporte: até 8 letras/números'),

    zipCode: digits(8, 'CEP'),
    residenceState: uf,
    residenceCity: text(60),
    street: text(80),
    number: text(10),
    neighborhood: text(40),
    complement: text(100),

    mobilePhone: z
      .string()
      .optional()
      .refine((v) => !v || [10, 11].includes(onlyDigits(v).length), 'Telefone deve ter 10 ou 11 dígitos'),
    contactPhone: z
      .string()
      .optional()
      .refine((v) => !v || [10, 11].includes(onlyDigits(v).length), 'Telefone deve ter 10 ou 11 dígitos'),
  }),

  clinical: z.object({
    notificationDate: isoDate,
    symptomStartDate: isoDate,

    symptoms: z.array(z.enum(valuesOf(SYMPTOM_OPTIONS))),
    otherSymptoms: text(60),

    conditions: z.array(z.enum(valuesOf(CONDITION_OPTIONS))),

    testStatus: choice(valuesOf(TEST_STATUS_OPTIONS)),
    testTypes: z.array(z.enum(valuesOf(TEST_TYPE_OPTIONS))),

    pcrRapidTestDate: isoDate,
    serologicalTestDate: isoDate,

    pcrRapidResult: choice(valuesOf(PCR_RESULT_OPTIONS)),

    serologyTypes: z.array(z.enum(valuesOf(SEROLOGY_TYPE_OPTIONS))),

    serologyResults: z.object({
      iga: choice(valuesOf(SEROLOGY_RESULT_OPTIONS)),
      igg: choice(valuesOf(SEROLOGY_RESULT_OPTIONS)),
      igm: choice(valuesOf(SEROLOGY_RESULT_OPTIONS)),
      total_antibodies: choice(valuesOf(SEROLOGY_RESULT_OPTIONS)),
    }),
  }),

  closure: z.object({
    evolution: choice(valuesOf(EVOLUTION_OPTIONS)),
    finalClassification: choice(valuesOf(FINAL_CLASSIFICATION_OPTIONS)),
    closureDate: isoDate,
    observations: text(400),
  }),
}) satisfies z.ZodType<NotificationForm, z.ZodTypeDef, unknown>

export type NotificationFormInput = z.input<typeof notificationSchema>
