import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  USER_STATUS_TYPES,
  userStatusSchema,
  type UserStatusType,
} from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import type { UserWithRole } from "better-auth/client/plugins"
import { UserCheck, UserX } from "lucide-react"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

function ReactivateDialog({
  user,
  unbanUser,
  unbanningUser,
}: {
  user: UserWithRole
  unbanUser: (userId: string) => Promise<unknown>
  unbanningUser: boolean
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            className="flex w-full items-center justify-start gap-4"
            variant="ghost"
          >
            <UserCheck /> Reativar Usuário
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reativar usuário</AlertDialogTitle>
          <AlertDialogDescription>
            O usuário <strong>{user.name}</strong> voltará a ter acesso ao
            sistema. Deseja continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={unbanningUser}
            onClick={() => unbanUser(user.id)}
          >
            Reativar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AlterStatusDialog({
  user,
  banUser,
  banningUser,
}: {
  user: UserWithRole
  banUser: (data: {
    userId: string
    banReason: string | undefined
    banExpires: Date | undefined
  }) => Promise<unknown>
  banningUser: boolean
}) {
  const [open, setOpen] = useState(false)

  const form = useForm<UserStatusType>({
    resolver: zodResolver(userStatusSchema),
    defaultValues: { statusType: "ferias", statusExpires: "" },
  })

  const statusType = useWatch({ control: form.control, name: "statusType" })
  const isPermanent = statusType === "desligamento"

  async function onSubmit(data: UserStatusType) {
    await banUser({
      userId: user.id,
      banReason: data.statusType,
      banExpires: data.statusExpires ? new Date(data.statusExpires) : undefined,
    })
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className="flex w-full items-center justify-start gap-4"
            variant="ghost"
          >
            <UserX /> Alterar Situação
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar situação do usuário</DialogTitle>
          <DialogDescription>
            Defina a nova situação de <strong>{user.name}</strong>. O acesso ao
            sistema será suspenso até a reativação.
          </DialogDescription>
        </DialogHeader>
        <form id="user-status-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="statusType"
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="statusType">Situação</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="statusType" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectPopup>
                      {USER_STATUS_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {!isPermanent && (
              <Controller
                control={form.control}
                name="statusExpires"
                render={({ field, fieldState }) => (
                  <Field aria-busy={fieldState.isDirty}>
                    <FieldLabel htmlFor="statusExpires">
                      Data de retorno
                    </FieldLabel>
                    <Input
                      id="statusExpires"
                      type="date"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
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
            form="user-status-form"
            label="Confirmar"
            loading={banningUser}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UserStatusDialog({
  user,
  banUser,
  unbanUser,
  banningUser,
  unbanningUser,
  disabled = false,
}: {
  user: UserWithRole
  banUser: (data: {
    userId: string
    banReason: string | undefined
    banExpires: Date | undefined
  }) => Promise<unknown>
  unbanUser: (userId: string) => Promise<unknown>
  banningUser: boolean
  unbanningUser: boolean
  disabled?: boolean
}) {
  if (disabled) return null

  if (user.banned) {
    return (
      <ReactivateDialog
        user={user}
        unbanUser={unbanUser}
        unbanningUser={unbanningUser}
      />
    )
  }

  return (
    <AlterStatusDialog user={user} banUser={banUser} banningUser={banningUser} />
  )
}

export { UserStatusDialog as BanUser }
