import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useAgencies } from "@/hooks/use-agencies"
import { useSectors } from "@/hooks/use-sectors"
import { useJobFunctions } from "@/hooks/use-job-functions"
import { useOrgProfile } from "@/hooks/use-org-profile"
import { orgProfileSchema, type OrgProfileType } from "@/lib/validations"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
  CardFooter,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { LoadingButton } from "@/components/ui/loading-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const NONE = ""

export function OrgProfileCard({ userId }: { userId: string }) {
  const { orgProfile, fetchingProfile, saveOrgProfile, savingProfile } =
    useOrgProfile(userId)
  const { agencies, fetchingAgencies } = useAgencies()
  const { sectors, fetchingSectors } = useSectors()
  const { jobFunctions, fetchingJobFunctions } = useJobFunctions()

  const form = useForm<OrgProfileType>({
    resolver: zodResolver(orgProfileSchema),
    defaultValues: {
      agencyId: null,
      sectorId: null,
      areaId: null,
      jobFunctionId: null,
    },
  })

  // Popula o formulário quando o perfil é carregado
  useEffect(() => {
    if (orgProfile !== undefined) {
      form.reset({
        agencyId: orgProfile?.agencyId ?? null,
        sectorId: orgProfile?.sectorId ?? null,
        areaId: orgProfile?.areaId ?? null,
        jobFunctionId: orgProfile?.jobFunctionId ?? null,
      })
    }
  }, [orgProfile, form])

  // Reseta areaId quando sectorId muda para um setor que não contém a área atual
  const watchedSectorId = useWatch({ control: form.control, name: "sectorId" })
  useEffect(() => {
    const currentAreaId = form.getValues("areaId")
    const sectorHasArea = availableAreas.some((a) => a.id === currentAreaId)
    if (!sectorHasArea) {
      form.setValue("areaId", null)
    }
  }, [watchedSectorId, availableAreas, form])

  const activeSectors = sectors?.filter((s) => s.isActive) ?? []
  const selectedSector = activeSectors.find((s) => s.id === watchedSectorId)
  const availableAreas = selectedSector?.areas.filter((a) => a.isActive) ?? []

  async function onSubmit(data: OrgProfileType) {
    await saveOrgProfile(data)
  }

  const loading =
    fetchingProfile || fetchingAgencies || fetchingSectors || fetchingJobFunctions

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vínculo organizacional</CardTitle>
        <CardDescription>
          Agência, setor, área e função do colaborador na cooperativa.
        </CardDescription>
      </CardHeader>
      <CardPanel>
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <form
            id="org-profile-form"
            onSubmit={form.handleSubmit(onSubmit)}
            autoComplete="off"
          >
            <FieldGroup>
              {/* Agência */}
              <Controller
                control={form.control}
                name="agencyId"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="org-agency">Agência</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value ?? NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                    >
                      <SelectTrigger id="org-agency">
                        <SelectValue placeholder="Nenhuma" />
                      </SelectTrigger>
                      <SelectPopup>
                        <SelectItem value={NONE}>Nenhuma</SelectItem>
                        {agencies?.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                  </Field>
                )}
              />

              {/* Setor */}
              <Controller
                control={form.control}
                name="sectorId"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="org-sector">Setor</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value ?? NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                    >
                      <SelectTrigger id="org-sector">
                        <SelectValue placeholder="Nenhum" />
                      </SelectTrigger>
                      <SelectPopup>
                        <SelectItem value={NONE}>Nenhum</SelectItem>
                        {activeSectors.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                  </Field>
                )}
              />

              {/* Área — desabilitada quando não há setor selecionado */}
              <Controller
                control={form.control}
                name="areaId"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="org-area">
                      Área{" "}
                      {!watchedSectorId && (
                        <span className="text-muted-foreground font-normal text-xs">
                          (selecione um setor primeiro)
                        </span>
                      )}
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value ?? NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                      disabled={!watchedSectorId || availableAreas.length === 0}
                    >
                      <SelectTrigger id="org-area">
                        <SelectValue placeholder="Nenhuma" />
                      </SelectTrigger>
                      <SelectPopup>
                        <SelectItem value={NONE}>Nenhuma</SelectItem>
                        {availableAreas.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                  </Field>
                )}
              />

              {/* Função */}
              <Controller
                control={form.control}
                name="jobFunctionId"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="org-function">Função</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value ?? NONE}
                      onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                    >
                      <SelectTrigger id="org-function">
                        <SelectValue placeholder="Nenhuma" />
                      </SelectTrigger>
                      <SelectPopup>
                        <SelectItem value={NONE}>Nenhuma</SelectItem>
                        {jobFunctions?.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        )}
      </CardPanel>
      <CardFooter className="justify-end">
        <LoadingButton
          disabled={form.formState.disabled || loading}
          form="org-profile-form"
          label="Salvar vínculo"
          loading={savingProfile}
        />
      </CardFooter>
    </Card>
  )
}
