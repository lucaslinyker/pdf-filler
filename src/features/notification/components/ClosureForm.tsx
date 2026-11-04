import { RadioGroupField, TextAreaField, TextField } from '../../../components/form/fields'
import { FieldGrid, Section } from '../../../components/ui/Section'
import { EVOLUTION_OPTIONS, FINAL_CLASSIFICATION_OPTIONS } from '../notification.options'

export function ClosureForm() {
  return (
    <div className="space-y-5">
      <Section title="Encerramento">
        <FieldGrid>
          <RadioGroupField name="closure.evolution" label="Evolução do caso" options={EVOLUTION_OPTIONS} />
          <RadioGroupField
            name="closure.finalClassification"
            label="Classificação final"
            options={FINAL_CLASSIFICATION_OPTIONS}
          />
        </FieldGrid>
        <FieldGrid>
          <TextField name="closure.closureDate" label="Data de encerramento" type="date" />
        </FieldGrid>
      </Section>

      <Section title="Informações complementares e observações">
        <TextAreaField
          name="closure.observations"
          label="Observações"
          maxLength={400}
          hint="A ficha tem 2 linhas pautadas: textos longos têm a fonte reduzida e, se ainda não couberem, são cortados com reticências (você será avisado)."
        />
      </Section>
    </div>
  )
}
