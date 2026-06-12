import { useEffect, useId, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DefaultHeader } from "@/components/ui/header-component"
import { LoadingButton } from "@/components/ui/loading-button"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { monthlyDataSchema, type MonthlyDataType } from "@/lib/validations"
import { VG_INDICATORS, MONTH_NAMES } from "@/lib/reports/vg-indicators"
import {
  useVGTargets,
  useVGRealized,
  useUpsertVGTargets,
  useUpsertVGRealized,
  type VGMonthlyData,
} from "@/hooks/use-reports"

const NONE = ""

interface MonthlyDataFormProps {
  slug: string
  year: number
  type: "targets" | "realized"
  data: VGMonthlyData | undefined
  isLoading: boolean
  onSave: (entries: MonthlyDataType["months"]) => Promise<void>
  isSaving: boolean
}

function MonthlyDataForm({
  data,
  isLoading,
  onSave,
  isSaving,
}: MonthlyDataFormProps) {
  const formId = useId()

  const form = useForm<MonthlyDataType>({
    resolver: zodResolver(monthlyDataSchema),
    defaultValues: {
      months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 0 })),
    },
  })

  const { fields } = useFieldArray({ control: form.control, name: "months" })

  useEffect(() => {
    if (!data) return
    form.reset({
      months: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        value: data.months.find((m) => m.month === i + 1)?.value ?? 0,
      })),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  async function onSubmit(formData: MonthlyDataType) {
    await onSave(formData.months)
    form.reset(formData)
  }

  if (isLoading) return <LoadingComponent />

  return (
    <div>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 text-left font-medium">Mês</th>
                <th className="w-48 pb-2 text-left font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr
                  key={field.id}
                  className="border-b last:border-0 odd:bg-muted/30"
                >
                  <td className="py-2 pr-4 font-medium">{MONTH_NAMES[index]}</td>
                  <td className="py-1">
                    <Controller
                      name={`months.${index}.value`}
                      control={form.control}
                      render={({ field: f, fieldState }) => (
                        <div className="flex flex-col gap-1">
                          <Input
                            {...f}
                            id={`${formId}-month-${index}`}
                            type="number"
                            step="0.01"
                            className={fieldState.error ? "border-destructive" : ""}
                            onChange={(e) => f.onChange(e.target.value)}
                          />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </div>
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>

      <div className="mt-4 flex justify-end">
        <LoadingButton
          form={formId}
          label="Salvar"
          loading={isSaving}
          disabled={isSaving || !form.formState.isDirty}
        />
      </div>
    </div>
  )
}

interface TabContentProps {
  slug: string
  year: number
  type: "targets" | "realized"
}

function TabContent({ slug, year, type }: TabContentProps) {
  const targetsQuery = useVGTargets(type === "targets" ? slug : null, year)
  const realizedQuery = useVGRealized(type === "realized" ? slug : null, year)
  const { mutateAsync: upsertTargets, isPending: savingTargets } = useUpsertVGTargets()
  const { mutateAsync: upsertRealized, isPending: savingRealized } = useUpsertVGRealized()

  const data = type === "targets" ? targetsQuery.data : realizedQuery.data
  const isLoading = type === "targets" ? targetsQuery.isPending : realizedQuery.isPending
  const isSaving = type === "targets" ? savingTargets : savingRealized

  async function handleSave(entries: MonthlyDataType["months"]) {
    if (type === "targets") {
      await upsertTargets({ slug, year, entries })
    } else {
      await upsertRealized({ slug, year, entries })
    }
  }

  return (
    <MonthlyDataForm
      slug={slug}
      year={year}
      type={type}
      data={data}
      isLoading={isLoading}
      onSave={handleSave}
      isSaving={isSaving}
    />
  )
}

export function MonthlyDataPage() {
  const [slug, setSlug] = useState<string>(NONE)
  const [year, setYear] = useState(new Date().getFullYear())

  const selectedIndicator = VG_INDICATORS.find((i) => i.slug === slug)
  const hasSelection = slug !== NONE && year >= 2020

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Dados do Portal — Metas e Realizados"
        description="Insira os valores mensais de meta e realizado para cada indicador."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seleção</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="indicator-select">Indicador</FieldLabel>
              <Select value={slug} onValueChange={setSlug}>
                <SelectTrigger id="indicator-select">
                  <SelectValue placeholder="Selecione um indicador">
                    {selectedIndicator?.name ?? null}
                  </SelectValue>
                </SelectTrigger>
                <SelectPopup>
                  {VG_INDICATORS.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Nenhum indicador configurado.
                    </div>
                  ) : (
                    VG_INDICATORS.map((indicator) => (
                      <SelectItem key={indicator.slug} value={indicator.slug}>
                        {indicator.name}
                      </SelectItem>
                    ))
                  )}
                </SelectPopup>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="year-input">Ano</FieldLabel>
              <Input
                id="year-input"
                type="number"
                min={2020}
                max={2040}
                value={year}
                onChange={(e) => {
                  const y = parseInt(e.target.value)
                  if (!isNaN(y)) setYear(y)
                }}
                className="w-32"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {!hasSelection ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed py-16 text-sm text-muted-foreground">
          Selecione um indicador e um ano para inserir os dados.
        </div>
      ) : (
        <Card className="flex-1">
          <CardContent className="pt-4">
            <Tabs defaultValue="metas">
              <TabsList className="mb-4">
                <TabsTrigger value="metas">Metas</TabsTrigger>
                <TabsTrigger value="realizados">Realizados</TabsTrigger>
              </TabsList>

              <TabsContent value="metas">
                <TabContent slug={slug} year={year} type="targets" />
              </TabsContent>

              <TabsContent value="realizados">
                <TabContent slug={slug} year={year} type="realized" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
