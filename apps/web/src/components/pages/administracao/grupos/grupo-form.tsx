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
import { groupSchema, type GroupType } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Shield } from "lucide-react"
import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"

type GrupoFormProps =
  | {
      mode: "create"
      onSubmit: (data: GroupType) => Promise<unknown>
      loading: boolean
    }
  | {
      mode: "edit"
      defaultValues: GroupType
      onSubmit: (data: GroupType) => Promise<unknown>
      loading: boolean
    }

export function GrupoForm(props: GrupoFormProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const formId = props.mode === "create" ? "grupo-create-form" : "grupo-edit-form"

  const form = useForm<GroupType>({
    resolver: zodResolver(groupSchema),
    defaultValues:
      props.mode === "edit"
        ? props.defaultValues
        : { name: "", description: "" },
  })

  async function onSubmit(data: GroupType) {
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
              <Shield />
              Novo Grupo
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="size-8">
              <Pencil />
              <span className="sr-only">Editar grupo</span>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Novo grupo" : "Editar grupo"}
          </DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "Preencha os campos para criar um novo grupo de acesso."
              : "Atualize os dados do grupo."}
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
                    placeholder="ex: Analistas"
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
                    placeholder="ex: Acesso a relatórios e análises"
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
            render={<Button type="button" variant="outline">Cancelar</Button>}
          />
          <LoadingButton
            disabled={form.formState.disabled}
            form={formId}
            label={props.mode === "create" ? "Criar grupo" : "Salvar alterações"}
            loading={props.loading || form.formState.isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function GrupoCreateButton({
  onSubmit,
  loading,
}: {
  onSubmit: (data: GroupType) => Promise<unknown>
  loading: boolean
}) {
  return <GrupoForm mode="create" onSubmit={onSubmit} loading={loading} />
}

export function GrupoEditButton({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues: GroupType
  onSubmit: (data: GroupType) => Promise<unknown>
  loading: boolean
}) {
  return (
    <GrupoForm
      mode="edit"
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      loading={loading}
    />
  )
}
