import { useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DefaultHeader } from "@/components/ui/header-component"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { LoadingButton } from "@/components/ui/loading-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { dashboardConfigSchema, type DashboardConfigType } from "@/lib/validations"
import { REPORTS_DASHBOARDS } from "@/lib/reports-hub"
import { useAdminDashboards, useConfigureDashboard, type AdminDashboard } from "@/hooks/use-reports"
import { useSectors } from "@/hooks/use-sectors"

const VISIBILITY_LABELS: Record<"all" | "sectors", string> = {
  all: "Todos os usuários",
  sectors: "Por setor",
}

interface DashboardConfigCardProps {
  dashboard: AdminDashboard
}

function DashboardConfigCard({ dashboard }: DashboardConfigCardProps) {
  const formId = useId()
  const config = REPORTS_DASHBOARDS.find((d) => d.slug === dashboard.slug)
  const { sectors, fetchingSectors } = useSectors()
  const { mutateAsync: configure, isPending: configuring } = useConfigureDashboard()

  const form = useForm<DashboardConfigType>({
    resolver: zodResolver(dashboardConfigSchema),
    values: {
      isActive: dashboard.isActive,
      visibility: dashboard.visibility,
      sectorIds: dashboard.sectorIds,
    },
  })

  const watchedVisibility = form.watch("visibility")
  const watchedActive = form.watch("isActive")

  async function onSubmit(data: DashboardConfigType) {
    await configure({ slug: dashboard.slug, ...data })
    form.reset(data)
  }

  const DashboardIcon = config?.icon

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {DashboardIcon && (
              <DashboardIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-base">
                {config?.name ?? dashboard.slug}
              </CardTitle>
              {config?.description && (
                <CardDescription className="mt-1">{config.description}</CardDescription>
              )}
            </div>
          </div>
          <Badge variant={watchedActive ? "default" : "outline"} className="shrink-0">
            {watchedActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Toggle ativo */}
            <Field orientation="horizontal">
              <FieldLabel>Ativar dashboard</FieldLabel>
              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </Field>

            {/* Visibilidade */}
            <Controller
              name="visibility"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-visibility`}>Visibilidade</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={`${formId}-visibility`} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione">
                        {VISIBILITY_LABELS[field.value as keyof typeof VISIBILITY_LABELS] ?? null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectPopup>
                      <SelectItem value="all">Todos os usuários</SelectItem>
                      <SelectItem value="sectors">Por setor</SelectItem>
                    </SelectPopup>
                  </Select>
                  <FieldDescription>
                    "Por setor" exige que o usuário tenha setor vinculado no perfil.
                  </FieldDescription>
                </Field>
              )}
            />

            {/* Setores — exibido somente quando visibility = "sectors" */}
            {watchedVisibility === "sectors" && (
              <Controller
                name="sectorIds"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Setores com acesso</FieldLabel>
                    {fetchingSectors ? (
                      <p className="text-sm text-muted-foreground">Carregando setores...</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {sectors?.map((sector) => (
                          <label
                            key={sector.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={field.value.includes(sector.id)}
                              onCheckedChange={(checked) => {
                                const updated = checked
                                  ? [...field.value, sector.id]
                                  : field.value.filter((id) => id !== sector.id)
                                field.onChange(updated)
                              }}
                            />
                            <span>{sector.name}</span>
                          </label>
                        ))}
                        {(!sectors || sectors.length === 0) && (
                          <p className="col-span-2 text-sm text-muted-foreground">
                            Nenhum setor cadastrado.
                          </p>
                        )}
                      </div>
                    )}
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <LoadingButton
          form={formId}
          label="Salvar configuração"
          loading={configuring}
          disabled={configuring || !form.formState.isDirty}
        />
      </CardFooter>
    </Card>
  )
}

export function DashboardsConfigPage() {
  const { data: dashboards, isPending: fetchingDashboards } = useAdminDashboards()

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Portal Relatórios — Configuração"
        description="Ative dashboards e controle quem pode visualizá-los."
      />

      {fetchingDashboards ? (
        <LoadingComponent />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {dashboards?.map((dashboard) => (
            <DashboardConfigCard key={dashboard.slug} dashboard={dashboard} />
          ))}
          {(!dashboards || dashboards.length === 0) && (
            <p className="col-span-2 py-12 text-center text-sm text-muted-foreground">
              Nenhum dashboard configurável encontrado.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
