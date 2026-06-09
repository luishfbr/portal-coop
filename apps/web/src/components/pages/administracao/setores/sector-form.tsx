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
import { Layers, Pencil } from "lucide-react"
import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"

type SectorFormProps =
  | {
      mode: "create"
      onSubmit: (data: CatalogType) => Promise<unknown>
      loading: boolean
    }
  | {
      mode: "edit"
      defaultValues: CatalogType
      onSubmit: (data: CatalogType) => Promise<unknown>
      loading: boolean
    }

function SectorForm(props: SectorFormProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const formId = props.mode === "create" ? "sector-create-form" : "sector-edit-form"

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
            <Button variant="default">
              <Layers />
              Novo Setor
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="size-8">
              <Pencil />
              <span className="sr-only">Editar setor</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Novo setor" : "Editar setor"}
          </DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "Preencha os campos para cadastrar um novo setor."
              : "Atualize os dados do setor."}
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
                    placeholder="ex: Recursos Humanos"
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
                    placeholder="ex: Gestão de pessoas e benefícios"
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
            label={props.mode === "create" ? "Criar setor" : "Salvar alterações"}
            loading={props.loading || form.formState.isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SectorCreateButton({
  onSubmit,
  loading,
}: {
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  return <SectorForm mode="create" onSubmit={onSubmit} loading={loading} />
}

export function SectorEditButton({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues: CatalogType
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  return (
    <SectorForm mode="edit" defaultValues={defaultValues} onSubmit={onSubmit} loading={loading} />
  )
}
