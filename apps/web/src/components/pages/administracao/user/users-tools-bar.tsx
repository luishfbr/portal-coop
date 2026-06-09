import SearchInput from "@/components/ui/search-input"
import type { AddUser } from "@/lib/validations"
import { UserForm } from "./user-form"

export const UsersToolsBar = ({
  createUser,
  onSearch,
}: {
  createUser: (data: AddUser) => Promise<unknown>
  onSearch: (value: string) => void
}) => {
  return (
    <div className="flex w-full flex-row items-center gap-2">
      <UserForm createUser={createUser} />
      <SearchInput placeholder="Procure pelo nome..." onSubmit={onSearch} />
    </div>
  )
}
