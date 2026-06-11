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
import { Briefcase } from "lucide-react"
import { useId, useRef } from "react"
import { Controller, useForm } from "react-hook-form"

export function JobFunctionCreateButton({
  onSubmit,
  loading,
}: {
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  const instanceId = useId()
  const formId = `job-function-create-form-${instanceId}`
  const closeRef = useRef<HTMLButtonElement>(null)

  const form = useForm<CatalogType>({
    resolver: zodResolver(catalogSchema),
    defaultValues: { name: "" },
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
          <Button variant="default">
            <Briefcase />
            Nova Função
          </Button>
        }
      />
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>Nova função</DialogTitle>
          <DialogDescription>
            Preencha os campos para cadastrar uma nova função.
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} autoComplete="off">
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
            label="Criar função"
            loading={loading || form.formState.isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function JobFunctionEditDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  loading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: CatalogType
  onSubmit: (data: CatalogType) => Promise<unknown>
  loading: boolean
}) {
  const instanceId = useId()
  const formId = `job-function-edit-form-${instanceId}`

  const form = useForm<CatalogType>({
    resolver: zodResolver(catalogSchema),
    defaultValues,
  })

  async function handleSubmit(data: CatalogType) {
    await onSubmit(data).then(() => {
      form.reset()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>Editar função</DialogTitle>
          <DialogDescription>Atualize os dados da função.</DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} autoComplete="off">
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
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
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
