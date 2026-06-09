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
import { Briefcase, Pencil } from "lucide-react"
import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"

type JobFunctionFormProps =
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

function JobFunctionForm(props: JobFunctionFormProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const formId =
    props.mode === "create" ? "job-function-create-form" : "job-function-edit-form"

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
              <Briefcase />
              Nova Função
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="size-8">
              <Pencil />
              <span className="sr-only">Editar função</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Nova função" : "Editar função"}
          </DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "Preencha os campos para cadastrar uma nova função."
              : "Atualize os dados da função."}
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
                    placeholder="ex: Analista de TI"
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
                <Field>
                  <FieldLabel htmlFor={`${formId}-desc`}>
                    Descrição{" "}
                    <span className="text-muted-foreground font-normal">(opcional)</span>
                  </FieldLabel>
                  <Input
                    id={`${formId}-desc`}
                    placeholder="ex: Suporte e desenvolvimento de sistemas"
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
            label={props.mode === "create" ? "Criar função" : "Salvar alterações"}
            loading={props.loading || form.formState.isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function JobFunctionCreateButton({
  onSubmit,
  loading,
}: {
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  return <JobFunctionForm mode="create" onSubmit={onSubmit} loading={loading} />
}

export function JobFunctionEditButton({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues: CatalogType
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  return (
    <JobFunctionForm
      mode="edit"
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      loading={loading}
    />
  )
}
