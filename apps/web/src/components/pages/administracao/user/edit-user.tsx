import type { UserWithRole } from "better-auth/client/plugins"

export const EditUser = ({ user }: { user: UserWithRole }) => {
  return <div>{user.email}</div>
}
