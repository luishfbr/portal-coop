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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addUserSchema, type AddUser } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlus } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

export function UserForm({
  createUser,
}: {
  createUser: (data: AddUser) => Promise<any>
}) {
  const form = useForm<AddUser>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  })

  async function onSubmit(data: AddUser) {
    await createUser(data)
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="default">
            <UserPlus />
            Novo Usuário
          </Button>
        }
      />
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>Crie um novo usuário</DialogTitle>
          <DialogDescription>
            Preencha todos os campos abaixo.
          </DialogDescription>
        </DialogHeader>
        <form
          id="user-form"
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
                  <Input id="name" {...field} placeholder="ex: Fulano" />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    {...field}
                    placeholder="ex: exemplo@dominio.com.br"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <Input id="password" {...field} type="password" />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="role">Senha</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value === "user" ? "Usuário" : "Administrador"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="role" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"user"}>Usuário</SelectItem>
                      <SelectItem value={"admin"}>Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
          />
          <LoadingButton
            disabled={form.formState.disabled}
            form="user-form"
            label="Criar Usuário"
            loading={form.formState.isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
