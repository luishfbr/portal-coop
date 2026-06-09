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
import { catalogSchema, type CatalogType } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Plus } from "lucide-react"
import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"

type AreaFormProps =
  | {
      mode: "create"
      sectorName: string
      onSubmit: (data: CatalogType) => Promise<unknown>
      loading: boolean
    }
  | {
      mode: "edit"
      defaultValues: CatalogType
      onSubmit: (data: CatalogType) => Promise<unknown>
      loading: boolean
    }

function AreaForm(props: AreaFormProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const formId = props.mode === "create" ? "area-create-form" : "area-edit-form"

  const form = useForm<CatalogType>({
    resolver: zodResolver(catalogSchema),
    defaultValues:
      props.mode === "edit" ? props.defaultValues : { name: "", description: "" },
  })

  async function onSubmit(data: CatalogType) {
    await props.onSubmit(data).then(() => {
      form.reset()
      closeRef.current?.click()
    })
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          props.mode === "create" ? (
            <Button variant="outline" size="sm">
              <Plus />
              Nova Área
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="size-7">
              <Pencil className="size-3.5" />
              <span className="sr-only">Editar área</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create"
              ? `Nova área — ${props.sectorName}`
              : "Editar área"}
          </DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "Preencha os campos para cadastrar uma nova área neste setor."
              : "Atualize os dados da área."}
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor={`${formId}-name`}>Nome</FieldLabel>
                  <Input
                    id={`${formId}-name`}
                    placeholder="ex: Recrutamento e Seleção"
                    {...field}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
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
          <DialogClose
            ref={closeRef}
            render={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
          />
          <LoadingButton
            disabled={form.formState.disabled}
            form={formId}
            label={props.mode === "create" ? "Criar área" : "Salvar alterações"}
            loading={props.loading || form.formState.isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AreaCreateButton({
  sectorName,
  onSubmit,
  loading,
}: {
  sectorName: string
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  return <AreaForm mode="create" sectorName={sectorName} onSubmit={onSubmit} loading={loading} />
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
  return (
    <AreaForm mode="edit" defaultValues={defaultValues} onSubmit={onSubmit} loading={loading} />
  )
}
