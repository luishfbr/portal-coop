import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Sector } from "@/hooks/use-sectors"
import { catalogSchema, type CatalogType } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { LayoutList, Pencil } from "lucide-react"
import { useId, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

// ── Formulário de edição de área ──────────────────────────────────────────────

type AreaEditFormProps = {
  defaultValues: CatalogType
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}

function AreaEditForm({ defaultValues, onSubmit, loading }: AreaEditFormProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const instanceId = useId()
  const formId = `area-edit-form-${instanceId}`

  const form = useForm<CatalogType>({
    resolver: zodResolver(catalogSchema),
    defaultValues,
  })

  async function handleSubmit(data: CatalogType) {
    await onSubmit(data).then(() => {
      form.reset()
      closeRef.current?.click()
    })
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="size-7">
            <Pencil className="size-3.5" />
            <span className="sr-only">Editar área</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>Editar área</DialogTitle>
          <DialogDescription>Atualize os dados da área.</DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} autoComplete="off">
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-name`}>Nome</FieldLabel>
                  <Input id={`${formId}-name`} placeholder="ex: Recrutamento e Seleção" {...field} />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-desc`}>
                    Descrição{" "}
                    <span className="text-muted-foreground font-normal">(opcional)</span>
                  </FieldLabel>
                  <Input
                    id={`${formId}-desc`}
                    placeholder="ex: Responsável pela seleção de talentos"
                    {...field}
                    value={field.value ?? ""}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose ref={closeRef} render={<Button type="button" variant="outline">Cancelar</Button>} />
          <LoadingButton
            disabled={form.formState.disabled}
            form={formId}
            label="Salvar alterações"
            loading={loading || form.formState.isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Botão de criar área (header) — inclui seletor de setor ────────────────────

const areaWithSectorSchema = catalogSchema.extend({
  sectorId: z.string().min(1, "Selecione um setor"),
})
type AreaWithSectorType = z.infer<typeof areaWithSectorSchema>

type AreaCreateHeaderButtonProps = {
  sectors: Sector[] | undefined
  onSubmit: (args: { sectorId: string; data: CatalogType }) => Promise<unknown>
  loading: boolean
}

export function AreaCreateHeaderButton({ sectors, onSubmit, loading }: AreaCreateHeaderButtonProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const formId = "area-create-header-form"

  const form = useForm<AreaWithSectorType>({
    resolver: zodResolver(areaWithSectorSchema),
    defaultValues: { sectorId: "", name: "", description: "" },
  })

  async function handleSubmit({ sectorId, ...data }: AreaWithSectorType) {
    await onSubmit({ sectorId, data }).then(() => {
      form.reset()
      closeRef.current?.click()
    })
  }

  const activeSectors = sectors?.filter((s) => s.isActive) ?? []

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline">
            <LayoutList />
            Nova Área
          </Button>
        }
      />
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>Nova área</DialogTitle>
          <DialogDescription>
            Selecione o setor e preencha os dados para cadastrar uma nova área.
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} autoComplete="off">
          <FieldGroup>
            <Controller
              control={form.control}
              name="sectorId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="area-create-sector">Setor</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="area-create-sector" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione um setor" />
                    </SelectTrigger>
                    <SelectPopup>
                      {activeSectors.length === 0 ? (
                        <SelectItem value="" disabled>Nenhum setor ativo</SelectItem>
                      ) : (
                        activeSectors.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectPopup>
                  </Select>
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="area-create-name">Nome</FieldLabel>
                  <Input id="area-create-name" placeholder="ex: Recrutamento e Seleção" {...field} />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="area-create-desc">
                    Descrição{" "}
                    <span className="text-muted-foreground font-normal">(opcional)</span>
                  </FieldLabel>
                  <Input
                    id="area-create-desc"
                    placeholder="ex: Responsável pela seleção de talentos"
                    {...field}
                    value={field.value ?? ""}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose ref={closeRef} render={<Button type="button" variant="outline">Cancelar</Button>} />
          <LoadingButton
            disabled={form.formState.disabled}
            form={formId}
            label="Criar área"
            loading={loading || form.formState.isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AreaEditButton({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues: CatalogType
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  return <AreaEditForm defaultValues={defaultValues} onSubmit={onSubmit} loading={loading} />
}
