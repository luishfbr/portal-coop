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
import { useJobFunctionUsers, type JobFunction } from "@/hooks/use-job-functions"

export function JobFunctionUsersDialog({ jobFunction }: { jobFunction: JobFunction }) {
  const [open, setOpen] = useState(false)
  const { users, fetchingUsers } = useJobFunctionUsers(open ? jobFunction.id : null)

  const count = jobFunction.userCount
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
          <DialogTitle>{jobFunction.name}</DialogTitle>
          <DialogDescription>
            Usuários com esta função atribuída no perfil organizacional.
          </DialogDescription>
        </DialogHeader>

        {fetchingUsers ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-44 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : users?.length ? (
          <ul className="flex flex-col divide-y divide-border">
            {users.map((u) => (
              <li key={u.id} className="flex flex-col py-2.5 first:pt-0 last:pb-0">
                <span className="text-sm font-medium leading-tight">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Users2 className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Nenhum usuário com esta função.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
