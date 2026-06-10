import { z } from "zod"

export const email = z.email("Insira um email válido!")

export const name = z.string().trim().min(1, "Campo obrigatório")

export const password = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial")

export const role = z.enum(["admin", "user"])

export const ROLE_LABELS: Record<"user" | "admin", string> = {
  user: "Usuário",
  admin: "Administrador",
}

export const loginSchema = z.object({
  email,
  password,
})

export const code = z
  .string()
  .length(6, "O código deve ter exatamente 6 dígitos")
  .regex(/^\d+$/, "O código deve conter apenas números")

export type LoginType = z.infer<typeof loginSchema>

export const codeSchema = z.object({
  code,
})

export type CodeType = z.infer<typeof codeSchema>

export const searchSchema = z.object({
  search: z.string().trim().min(1),
})

export type SearchType = z.infer<typeof searchSchema>

export const addUserSchema = z.object({
  name,
  email,
  password,
  role,
})

export type AddUser = z.infer<typeof addUserSchema>

export const editUserSchema = z.object({
  name,
  email,
  role,
  banned: z.boolean(),
  banReason: z.string().trim().optional(),
  banExpires: z.string().optional(),
  image: z.string().trim().optional(),
})

export type EditUserType = z.infer<typeof editUserSchema>

export const USER_STATUS_TYPES = [
  { value: "ferias", label: "Férias" },
  { value: "licenca", label: "Licença" },
  { value: "afastamento", label: "Afastamento" },
  { value: "desligamento", label: "Desligamento" },
] as const

export type UserStatusValue = (typeof USER_STATUS_TYPES)[number]["value"]

export const userStatusSchema = z
  .object({
    statusType: z.enum([
      "ferias",
      "licenca",
      "afastamento",
      "desligamento",
    ] as const),
    statusExpires: z.string().optional(),
  })
  .refine((d) => d.statusType === "desligamento" || !!d.statusExpires, {
    message: "Informe a data de retorno",
    path: ["statusExpires"],
  })
  .refine(
    (d) =>
      d.statusType === "desligamento" ||
      !d.statusExpires ||
      new Date(d.statusExpires) > new Date(),
    { message: "A data de retorno deve ser no futuro", path: ["statusExpires"] }
  )

export type UserStatusType = z.infer<typeof userStatusSchema>

export const setPasswordSchema = z
  .object({
    newPassword: password,
    confirmPassword: password,
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type SetPasswordType = z.infer<typeof setPasswordSchema>

// ── Catálogos organizacionais ────────────────────────────────────────────────

export const catalogSchema = z.object({
  name,
  description: z.string().trim().optional(),
})

export type CatalogType = z.infer<typeof catalogSchema>

// ── Perfil organizacional do usuário ────────────────────────────────────────

export const orgProfileSchema = z.object({
  agencyId: z.string().nullable().optional(),
  sectorId: z.string().nullable().optional(),
  areaId: z.string().nullable().optional(),
  jobFunctionId: z.string().nullable().optional(),
})

export type OrgProfileType = z.infer<typeof orgProfileSchema>
