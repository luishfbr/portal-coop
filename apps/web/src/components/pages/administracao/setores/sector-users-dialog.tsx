import { useState } from "react"
import { Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAreaUsers, useSectorUsers, type Area, type Sector } from "@/hooks/use-sectors"

function UsersDialogContent({ fetchingUsers, users }: {
  fetchingUsers: boolean
  users: { id: string; name: string; email: string }[] | undefined
}) {
  if (fetchingUsers) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-44 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (users?.length) {
    return (
      <ul className="flex flex-col divide-y divide-border">
        {users.map((u) => (
          <li key={u.id} className="flex flex-col py-2.5 first:pt-0 last:pb-0">
            <span className="text-sm font-medium leading-tight">{u.name}</span>
            <span className="text-xs text-muted-foreground">{u.email}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <Users2 className="size-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Nenhum usuário vinculado.</p>
    </div>
  )
}

export function SectorUsersDialog({ sector }: { sector: Sector }) {
  const [open, setOpen] = useState(false)
  const { users, fetchingUsers } = useSectorUsers(open ? sector.id : null)

  const count = sector.userCount
  const label = count === 1 ? "1 usuário" : `${count} usuários`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs">
            <Users2 className="size-3.5" />
            {label}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{sector.name}</DialogTitle>
          <DialogDescription>
            Usuários com este setor atribuído no perfil organizacional.
          </DialogDescription>
        </DialogHeader>
        <UsersDialogContent fetchingUsers={fetchingUsers} users={users} />
      </DialogContent>
    </Dialog>
  )
}

export function AreaUsersDialog({ area, sectorId }: { area: Area; sectorId: string }) {
  const [open, setOpen] = useState(false)
  const { users, fetchingUsers } = useAreaUsers(open ? sectorId : null, open ? area.id : null)

  const count = area.userCount
  const label = count === 1 ? "1 usuário" : `${count} usuários`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-xs">
            <Users2 className="size-3" />
            {label}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{area.name}</DialogTitle>
          <DialogDescription>
            Usuários com esta área atribuída no perfil organizacional.
          </DialogDescription>
        </DialogHeader>
        <UsersDialogContent fetchingUsers={fetchingUsers} users={users} />
      </DialogContent>
    </Dialog>
  )
}
