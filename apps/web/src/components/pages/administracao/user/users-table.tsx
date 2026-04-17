import { MoreHorizontalIcon, Pencil, Trash } from "lucide-react"
import type { UserWithRole } from "better-auth/client/plugins"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/auth"
import { useNavigate } from "@tanstack/react-router"

export const UsersTable = ({
  users,
  loggedUser,
}: {
  users: UserWithRole[] | undefined
  loggedUser: User
}) => {
  const navigate = useNavigate()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Descrição Status</TableHead>
          <TableHead>Termina em</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="text-right" />
        </TableRow>
      </TableHeader>
      {users ? (
        users.map((user) => (
          <TableBody key={user.id}>
            <TableRow>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge>
                  {user.role === "admin" ? "Administrador" : "Usuário"}
                </Badge>
              </TableCell>
              <TableCell>{user.banned ? "Inativo" : "Ativo"}</TableCell>
              <TableCell>{user.banReason ?? "--"}</TableCell>
              <TableCell>
                {user.banExpires
                  ? new Date(user.banExpires).toLocaleDateString("pt-BR")
                  : "--"}
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell className="text-end">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Abrir Menu</span>
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        navigate({
                          to: "/administracao/usuario/$userId",
                          params: {
                            userId: user.id,
                          },
                        })
                      }}
                    >
                      <Pencil />
                      Editar Usuário
                    </DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={user.id === loggedUser.id}
                    >
                      <Trash /> Excluir Usuário
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        ))
      ) : (
        <TableCaption>Nenhum registro encontrado.</TableCaption>
      )}
    </Table>
  )
}
