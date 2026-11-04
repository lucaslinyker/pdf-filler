import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { createEmptyForm, createSampleForm } from '../../features/notification/notification.defaults'
import { generateNotificationPdf } from './pdf-generator'

const templateBytes = readFileSync(join(process.cwd(), 'public/templates/covid-2020/template.pdf'))
// Helvetica (WinAnsi) cobre ã, ç, é, ô e dispensa o fontkit nos testes.
const fontProvider = (doc: PDFDocument) => doc.embedFont(StandardFonts.Helvetica)
const run = (form = createSampleForm(), debug = false) =>
  generateNotificationPdf(form, { templateBytes, fontProvider, debug })

describe('geração do PDF', () => {
  it('preserva o número de páginas e o formato A4', async () => {
    const { bytes } = await run()
    const doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(1)
    const { width, height } = doc.getPage(0).getSize()
    expect(width).toBeCloseTo(595.32, 1)
    expect(height).toBeCloseTo(841.92, 1)
  })

  it('gera um PDF válido e o preenchimento acrescenta conteúdo sobre o modelo', async () => {
    const empty = await run(createEmptyForm())
    const filled = await run()
    expect(Buffer.from(filled.bytes.slice(0, 5)).toString()).toBe('%PDF-')
    expect(filled.bytes.length).toBeGreaterThan(empty.bytes.length)
  })

  it('formulário vazio mantém o documento válido e sem avisos', async () => {
    const { bytes, warnings } = await run(createEmptyForm())
    expect(warnings).toHaveLength(0)
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1)
  })

  it('aceita caracteres portugueses (ã, ç, é, ô) sem erro', async () => {
    const form = createSampleForm()
    form.identification.fullName = 'JOÃO AÇÃO PÔNEI É CAFÉ'
    form.closure.observations = 'Coração, ação, órgão, avô, ênfase.'
    await expect(run(form)).resolves.toBeDefined()
  })

  it('substitui por "?" caracteres que a fonte não suporta, sem lançar erro', async () => {
    const form = createSampleForm()
    form.identification.fullName = 'Teste ☃ 日本'
    await expect(run(form)).resolves.toBeDefined()
  })

  it('avisa quando um texto precisa ser reduzido ou cortado', async () => {
    const form = createSampleForm()
    form.identification.notificationCity = 'MUNICÍPIO COM UM NOME ABSURDAMENTE LONGO PARA CABER AQUI'
    form.closure.observations = 'palavra '.repeat(60)
    const { warnings } = await run(form)
    const fields = warnings.map((w) => w.field)
    expect(fields).toContain('identification.notificationCity')
    const obs = warnings.filter((w) => w.field === 'closure.observations').map((w) => w.type)
    expect(obs).toContain('truncated')
  })

  it('os avisos não carregam dados do paciente', async () => {
    const form = createSampleForm()
    form.closure.observations = 'SEGREDO '.repeat(60)
    const { warnings } = await run(form)
    expect(JSON.stringify(warnings)).not.toContain('SEGREDO')
  })

  it('modo debug adiciona grade e marcadores sem alterar a página', async () => {
    const plain = await run(createSampleForm(), false)
    const debug = await run(createSampleForm(), true)
    expect(debug.bytes.length).toBeGreaterThan(plain.bytes.length)
    expect((await PDFDocument.load(debug.bytes)).getPageCount()).toBe(1)
  })
})
