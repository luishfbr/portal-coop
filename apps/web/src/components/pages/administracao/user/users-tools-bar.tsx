import SearchInput from "@/components/ui/search-input"
import { UserForm } from "./user-form"
import type { AddUser } from "@/lib/validations"

export const UsersToolsBar = ({
  totalUsers,
  createUser,
}: {
  totalUsers: number
  createUser: (data: AddUser) => Promise<any>
}) => {
  return (
    <div className="flex w-full flex-row items-center justify-between gap-2">
      <div className="flex w-full flex-row items-center gap-2">
        <UserForm createUser={createUser} />
        <SearchInput
          polaceholder="Procure pelo nome..."
          onSubmit={(e: string) => console.log("Valor a ser procurado.", e)}
        />
      </div>
      <span className="text-xs text-nowrap text-muted-foreground">
        {totalUsers}{" "}
        {totalUsers > 1 ? "usuários cadastrados." : "usuário cadastrado."}
      </span>
    </div>
  )
}
