import { useFormContext, useWatch } from 'react-hook-form'
import {
  RadioGroupField,
  SelectField,
  TextField,
  YesNoField,
} from '../../../components/form/fields'
import { FieldGrid, Section } from '../../../components/ui/Section'
import {
  maskCep,
  maskCns,
  maskCpf,
  maskPhone,
  normalizeNotificationNumber,
  normalizePassport,
} from '../../../utils/masks'
import { RACE_OPTIONS, SEX_OPTIONS, UF_LIST } from '../notification.options'
import type { NotificationFormInput } from '../notification.schema'

export function IdentificationForm() {
  const { control, setValue } = useFormContext<NotificationFormInput>()
  const hasCpf = useWatch({ control, name: 'identification.hasCpf' })
  const isForeign = useWatch({ control, name: 'identification.isForeign' })
  const isHealthProfessional = useWatch({ control, name: 'identification.isHealthProfessional' })
  const race = useWatch({ control, name: 'identification.race' })

  return (
    <div className="space-y-5">
      <Section title="Informações da notificação">
        <FieldGrid cols={3}>
          <TextField
            name="identification.notificationNumber"
            label="Número da notificação"
            mask={normalizeNotificationNumber}
          />
          <SelectField name="identification.notificationState" label="UF de notificação" options={UF_LIST} />
          <TextField name="identification.notificationCity" label="Município de notificação" />
        </FieldGrid>
      </Section>

      <Section title="Identificação documental">
        <FieldGrid>
          <YesNoField
            name="identification.hasCpf"
            label="Tem CPF?"
            onChange={(v) => {
              if (v !== true) setValue('identification.cpf', '', { shouldDirty: true })
            }}
          />
          <YesNoField
            name="identification.isForeign"
            label="Estrangeiro?"
            onChange={(v) => {
              if (v !== true) {
                setValue('identification.countryOfOrigin', '', { shouldDirty: true })
                setValue('identification.passport', '', { shouldDirty: true })
              }
            }}
          />
          <YesNoField
            name="identification.isHealthProfessional"
            label="Profissional de saúde?"
            onChange={(v) => {
              if (v !== true) setValue('identification.cbo', '', { shouldDirty: true })
            }}
          />
          <YesNoField name="identification.isSecurityProfessional" label="Profissional de segurança?" />
        </FieldGrid>

        {(hasCpf === true || isHealthProfessional === true) && (
          <FieldGrid>
            {hasCpf === true && (
              <TextField
                name="identification.cpf"
                label="CPF"
                mask={maskCpf}
                inputMode="numeric"
                placeholder="000.000.000-00"
              />
            )}
            {isHealthProfessional === true && <TextField name="identification.cbo" label="CBO" />}
          </FieldGrid>
        )}

        <TextField
          name="identification.cns"
          label="CNS"
          mask={maskCns}
          inputMode="numeric"
          placeholder="000 0000 0000 0000"
          hint="Cartão Nacional de Saúde (15 dígitos). A ficha impressa tem 14 células: o 15º dígito é escrito logo após a última."
        />

        {isForeign === true && (
          <FieldGrid>
            <TextField name="identification.countryOfOrigin" label="País de origem" />
            <TextField
              name="identification.passport"
              label="Passaporte"
              mask={normalizePassport}
              hint="Até 8 letras/números (8 células na ficha)."
            />
          </FieldGrid>
        )}
      </Section>

      <Section title="Dados pessoais">
        <TextField name="identification.fullName" label="Nome completo" autoComplete="off" />
        <TextField name="identification.motherName" label="Nome completo da mãe" autoComplete="off" />
        <FieldGrid>
          <TextField name="identification.birthDate" label="Data de nascimento" type="date" />
        </FieldGrid>
        <FieldGrid>
          <RadioGroupField name="identification.sex" label="Sexo" options={SEX_OPTIONS} />
          <RadioGroupField
            name="identification.race"
            label="Raça/Cor"
            options={RACE_OPTIONS}
            columns={2}
            onChange={(v) => {
              if (v !== 'indigenous') setValue('identification.ethnicity', '', { shouldDirty: true })
            }}
          />
        </FieldGrid>
        {race === 'indigenous' && (
          <FieldGrid>
            <TextField name="identification.ethnicity" label="Etnia" />
          </FieldGrid>
        )}
      </Section>

      <Section title="Endereço">
        <FieldGrid cols={3}>
          <TextField name="identification.zipCode" label="CEP" mask={maskCep} inputMode="numeric" placeholder="00000-000" />
          <SelectField name="identification.residenceState" label="Estado de residência" options={UF_LIST} />
          <TextField name="identification.residenceCity" label="Município de residência" />
        </FieldGrid>
        <FieldGrid cols={3}>
          <TextField name="identification.street" label="Logradouro" className="sm:col-span-2" />
          <TextField name="identification.number" label="Número" />
        </FieldGrid>
        <FieldGrid>
          <TextField name="identification.neighborhood" label="Bairro" />
          <TextField name="identification.complement" label="Complemento" />
        </FieldGrid>
      </Section>

      <Section title="Contato">
        <FieldGrid>
          <TextField
            name="identification.mobilePhone"
            label="Telefone celular"
            type="tel"
            mask={maskPhone}
            inputMode="tel"
            placeholder="(00) 00000-0000"
          />
          <TextField
            name="identification.contactPhone"
            label="Telefone de contato"
            type="tel"
            mask={maskPhone}
            inputMode="tel"
            placeholder="(00) 0000-0000"
          />
        </FieldGrid>
      </Section>
    </div>
  )
}
