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
import { Building2, Pencil } from "lucide-react"
import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"

type AgencyFormProps =
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

export function AgencyForm(props: AgencyFormProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  const form = useForm<CatalogType>({
    resolver: zodResolver(catalogSchema),
    defaultValues:
      props.mode === "edit" ? props.defaultValues : { name: "" },
  })

  async function onSubmit(data: CatalogType) {
    await props.onSubmit(data).then(() => {
      form.reset()
      closeRef.current?.click()
    })
  }

  const formId = props.mode === "create" ? "agency-create-form" : "agency-edit-form"

  return (
    <Dialog>
      <DialogTrigger
        render={
          props.mode === "create" ? (
            <Button variant="default">
              <Building2 />
              Nova Agência
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="size-8">
              <Pencil />
              <span className="sr-only">Editar agência</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Nova agência" : "Editar agência"}
          </DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "Preencha os campos para cadastrar uma nova agência."
              : "Atualize os dados da agência."}
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={`${formId}-name`}>Nome</FieldLabel>
                  <Input
                    id={`${formId}-name`}
                    placeholder="ex: Agência Centro"
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
            label={props.mode === "create" ? "Criar agência" : "Salvar alterações"}
            loading={props.loading || form.formState.isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AgencyCreateButton({
  onSubmit,
  loading,
}: {
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  return <AgencyForm mode="create" onSubmit={onSubmit} loading={loading} />
}

export function AgencyEditButton({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues: CatalogType
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  return (
    <AgencyForm
      mode="edit"
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      loading={loading}
    />
  )
}
