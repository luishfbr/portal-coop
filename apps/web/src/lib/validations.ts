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
