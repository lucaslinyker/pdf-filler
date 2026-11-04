import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { CheckboxGroupField, RadioGroupField, TextField } from '../../../components/form/fields'
import { FieldGrid, Section } from '../../../components/ui/Section'
import {
  CONDITION_OPTIONS,
  PCR_RESULT_OPTIONS,
  SEROLOGY_RESULT_OPTIONS,
  SEROLOGY_TYPE_OPTIONS,
  SYMPTOM_OPTIONS,
  TEST_STATUS_OPTIONS,
  TEST_TYPE_OPTIONS,
} from '../notification.options'
import type { NotificationFormInput } from '../notification.schema'
import type { SerologyTypeValue } from '../notification.types'

export function ClinicalForm() {
  const { control, setValue, getValues } = useFormContext<NotificationFormInput>()
  const symptoms = useWatch({ control, name: 'clinical.symptoms' })
  const serologyTypes = useWatch({ control, name: 'clinical.serologyTypes' })

  // Desmarcar "Outros" limpa a descrição.
  useEffect(() => {
    if (!symptoms?.includes('others') && getValues('clinical.otherSymptoms')) {
      setValue('clinical.otherSymptoms', '', { shouldDirty: true })
    }
  }, [symptoms, getValues, setValue])

  // Desmarcar um exame sorológico limpa o resultado correspondente.
  useEffect(() => {
    for (const { value } of SEROLOGY_TYPE_OPTIONS) {
      const key = `clinical.serologyResults.${value}` as const
      if (!serologyTypes?.includes(value) && getValues(key)) {
        setValue(key, undefined, { shouldDirty: true })
      }
    }
  }, [serologyTypes, getValues, setValue])

  const selectedSerology = SEROLOGY_TYPE_OPTIONS.filter((o) => serologyTypes?.includes(o.value as SerologyTypeValue))

  return (
    <div className="space-y-5">
      <Section title="Datas">
        <FieldGrid>
          <TextField name="clinical.notificationDate" label="Data da notificação" type="date" />
          <TextField name="clinical.symptomStartDate" label="Data do início dos sintomas" type="date" />
        </FieldGrid>
      </Section>

      <Section title="Sintomas" description="Marque todos que se aplicam.">
        <CheckboxGroupField name="clinical.symptoms" label="Sintomas" options={SYMPTOM_OPTIONS} columns={2} />
        {symptoms?.includes('others') && (
          <TextField name="clinical.otherSymptoms" label="Outros sintomas (descrição)" maxLength={60} />
        )}
      </Section>

      <Section title="Condições" description="Marque todas que se aplicam.">
        <CheckboxGroupField name="clinical.conditions" label="Condições" options={CONDITION_OPTIONS} />
      </Section>

      <Section title="Teste">
        <FieldGrid>
          <RadioGroupField name="clinical.testStatus" label="Estado do teste" options={TEST_STATUS_OPTIONS} />
          <CheckboxGroupField name="clinical.testTypes" label="Tipo de teste" options={TEST_TYPE_OPTIONS} />
        </FieldGrid>
        <FieldGrid>
          <TextField name="clinical.pcrRapidTestDate" label="Data do teste (PCR/Rápidos)" type="date" />
          <TextField name="clinical.serologicalTestDate" label="Data do teste (Sorológico)" type="date" />
        </FieldGrid>
      </Section>

      <Section title="Resultados">
        <RadioGroupField
          name="clinical.pcrRapidResult"
          label="Resultado (PCR/Rápidos)"
          options={PCR_RESULT_OPTIONS}
        />
        <CheckboxGroupField
          name="clinical.serologyTypes"
          label="Teste sorológico"
          options={SEROLOGY_TYPE_OPTIONS}
          columns={2}
          hint="Ao marcar um exame, o campo do resultado correspondente é liberado."
        />
        {selectedSerology.length > 0 && (
          <FieldGrid>
            {selectedSerology.map((o) => (
              <RadioGroupField
                key={o.value}
                name={`clinical.serologyResults.${o.value}`}
                label={`Resultado (${o.label})`}
                options={SEROLOGY_RESULT_OPTIONS}
              />
            ))}
          </FieldGrid>
        )}
      </Section>
    </div>
  )
}
