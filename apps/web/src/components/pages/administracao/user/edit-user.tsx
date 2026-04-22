import type { UserWithRole } from "better-auth/client/plugins"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  editUserSchema,
  setPasswordSchema,
  USER_STATUS_TYPES,
  type SetPasswordType,
} from "@/lib/validations"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
  CardFooter,
} from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { UserStatusDialog } from "./ban-user"

type EditBasicType = z.infer<
  ReturnType<typeof editUserSchema.pick<{ name: true; email: true; role: true }>>
>

type Session = {
  id: string
  token: string
  userId: string
  createdAt: Date
  expiresAt: Date
  userAgent?: string | null
  ipAddress?: string | null
}

// ── Card 1: Dados básicos ────────────────────────────────────────────────────

function BasicDataCard({
  user,
  updateUser,
  updatingUser,
  isOwnProfile,
}: {
  user: UserWithRole
  updateUser: (data: {
    userId: string
    data: { name?: string; email?: string; role?: string }
  }) => Promise<unknown>
  updatingUser: boolean
  isOwnProfile: boolean
}) {
  const schema = editUserSchema.pick({ name: true, email: true, role: true })

  const form = useForm<EditBasicType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email,
      role: (user.role as "admin" | "user") ?? "user",
    },
  })

  async function onSubmit(data: EditBasicType) {
    await updateUser({ userId: user.id, data })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados básicos</CardTitle>
        <CardDescription>Nome, e-mail e perfil de acesso.</CardDescription>
      </CardHeader>
      <CardPanel>
        <form id="edit-basic-form" onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="edit-name">Nome Completo</FieldLabel>
                  <Input id="edit-name" {...field} />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="edit-email">E-mail</FieldLabel>
                  <Input id="edit-email" {...field} />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {!isOwnProfile && (
              <Controller
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <Field aria-busy={fieldState.isDirty}>
                    <FieldLabel htmlFor="edit-role">Perfil</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="edit-role" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectPopup>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectPopup>
                    </Select>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </form>
      </CardPanel>
      <CardFooter className="justify-end">
        <LoadingButton
          disabled={form.formState.disabled}
          form="edit-basic-form"
          label="Salvar alterações"
          loading={updatingUser}
        />
      </CardFooter>
    </Card>
  )
}

// ── Card 2: Situação da conta ────────────────────────────────────────────────

function AccountStatusCard({
  user,
  banUser,
  banningUser,
  unbanUser,
  unbanningUser,
  isOwnProfile,
}: {
  user: UserWithRole
  banUser: (data: {
    userId: string
    banReason: string | undefined
    banExpiresIn: number | undefined
  }) => Promise<unknown>
  banningUser: boolean
  unbanUser: (userId: string) => Promise<unknown>
  unbanningUser: boolean
  isOwnProfile: boolean
}) {
  const statusLabel = USER_STATUS_TYPES.find(
    (t) => t.value === user.banReason
  )?.label

  return (
    <Card>
      <CardHeader>
        <CardTitle>Situação da conta</CardTitle>
        <CardDescription>
          Gerencie o acesso ao sistema: férias, licenças, afastamentos e
          desligamentos.
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full",
                  user.banned ? "bg-red-500" : "bg-emerald-500"
                )}
              />
              {user.banned ? "Inativo" : "Ativo"}
            </Badge>
            {user.banned && statusLabel && (
              <span className="text-sm text-muted-foreground">
                {statusLabel}
                {user.banExpires && (
                  <>
                    {" · Retorno em "}
                    <strong>
                      {new Date(user.banExpires).toLocaleDateString("pt-BR")}
                    </strong>
                  </>
                )}
              </span>
            )}
          </div>
          <UserStatusDialog
            user={user}
            banUser={banUser}
            unbanUser={unbanUser}
            banningUser={banningUser}
            unbanningUser={unbanningUser}
            disabled={isOwnProfile}
          />
        </div>
      </CardPanel>
    </Card>
  )
}

// ── Card 3: Redefinir senha ──────────────────────────────────────────────────

function PasswordCard({
  user,
  setUserPassword,
  settingPassword,
}: {
  user: UserWithRole
  setUserPassword: (data: {
    userId: string
    newPassword: string
  }) => Promise<unknown>
  settingPassword: boolean
}) {
  const form = useForm<SetPasswordType>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  async function onSubmit(data: SetPasswordType) {
    await setUserPassword({ userId: user.id, newPassword: data.newPassword })
    form.reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redefinir senha</CardTitle>
        <CardDescription>
          Defina uma nova senha para o acesso deste usuário.
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <form
          id="edit-password-form"
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
                  <Input id="new-password" type="password" {...field} />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field aria-busy={fieldState.isDirty}>
                  <FieldLabel htmlFor="confirm-password">
                    Confirmar nova senha
                  </FieldLabel>
                  <Input id="confirm-password" type="password" {...field} />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardPanel>
      <CardFooter className="justify-end">
        <LoadingButton
          disabled={form.formState.disabled}
          form="edit-password-form"
          label="Atualizar senha"
          loading={settingPassword}
        />
      </CardFooter>
    </Card>
  )
}

// ── Card 4: Sessões ativas ───────────────────────────────────────────────────

function SessionsCard({
  user,
  userSessions,
  fetchingSessions,
  revokeUserSession,
  revokingSession,
  revokeUserSessions,
  revokingAllSessions,
}: {
  user: UserWithRole
  userSessions: Session[] | undefined
  fetchingSessions: boolean
  revokeUserSession: (data: {
    sessionToken: string
    userId: string
  }) => Promise<unknown>
  revokingSession: boolean
  revokeUserSessions: (userId: string) => Promise<unknown>
  revokingAllSessions: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessões ativas</CardTitle>
        <CardDescription>
          Gerencie as sessões abertas deste usuário.
        </CardDescription>
        {userSessions && userSessions.length > 0 && (
          <div className="col-start-2 row-span-2 row-start-1 inline-flex self-start justify-self-end">
            <Button
              variant="outline"
              size="sm"
              disabled={revokingAllSessions}
              onClick={() => revokeUserSessions(user.id)}
            >
              Revogar todas
            </Button>
          </div>
        )}
      </CardHeader>
      <CardPanel>
        {fetchingSessions ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !userSessions || userSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma sessão ativa.
          </p>
        ) : (
          <div className="flex flex-col divide-y">
            {userSessions.map((session, i) => (
              <div
                key={session.id}
                className={cn(
                  "flex items-center justify-between gap-4 py-3",
                  i === 0 && "pt-0",
                  i === userSessions.length - 1 && "pb-0"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium truncate max-w-xs">
                    {session.userAgent
                      ? session.userAgent.slice(0, 60)
                      : `Sessão ${session.id.slice(0, 8)}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.ipAddress
                      ? `${session.ipAddress} · `
                      : ""}
                    Criada em{" "}
                    {new Date(session.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={revokingSession}
                  onClick={() =>
                    revokeUserSession({
                      sessionToken: session.token,
                      userId: user.id,
                    })
                  }
                >
                  Revogar
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardPanel>
    </Card>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function EditUser({
  user,
  isOwnProfile,
  updateUser,
  updatingUser,
  banUser,
  banningUser,
  unbanUser,
  unbanningUser,
  setUserPassword,
  settingPassword,
  userSessions,
  fetchingSessions,
  revokeUserSession,
  revokingSession,
  revokeUserSessions,
  revokingAllSessions,
}: {
  user: UserWithRole
  isOwnProfile: boolean
  updateUser: (data: {
    userId: string
    data: { name?: string; email?: string; role?: string }
  }) => Promise<unknown>
  updatingUser: boolean
  banUser: (data: {
    userId: string
    banReason: string | undefined
    banExpiresIn: number | undefined
  }) => Promise<unknown>
  banningUser: boolean
  unbanUser: (userId: string) => Promise<unknown>
  unbanningUser: boolean
  setUserPassword: (data: {
    userId: string
    newPassword: string
  }) => Promise<unknown>
  settingPassword: boolean
  userSessions: Session[] | undefined
  fetchingSessions: boolean
  revokeUserSession: (data: {
    sessionToken: string
    userId: string
  }) => Promise<unknown>
  revokingSession: boolean
  revokeUserSessions: (userId: string) => Promise<unknown>
  revokingAllSessions: boolean
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BasicDataCard
        user={user}
        updateUser={updateUser}
        updatingUser={updatingUser}
        isOwnProfile={isOwnProfile}
      />
      <AccountStatusCard
        user={user}
        banUser={banUser}
        banningUser={banningUser}
        unbanUser={unbanUser}
        unbanningUser={unbanningUser}
        isOwnProfile={isOwnProfile}
      />
      <PasswordCard
        user={user}
        setUserPassword={setUserPassword}
        settingPassword={settingPassword}
      />
      <SessionsCard
        user={user}
        userSessions={userSessions}
        fetchingSessions={fetchingSessions}
        revokeUserSession={revokeUserSession}
        revokingSession={revokingSession}
        revokeUserSessions={revokeUserSessions}
        revokingAllSessions={revokingAllSessions}
      />
    </div>
  )
}
