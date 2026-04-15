import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { modules } from "@/lib/modules-types"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const adminModule = modules.find((m) => m.url === "/administracao")
const adminMenu = adminModule?.menu ?? []

export function AdminHome() {
  const [search, setSearch] = useState("")

  const filtered = adminMenu.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Painel de Administração</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as funcionalidades administrativas do sistema.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar funcionalidade..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <Card key={item.url} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <item.icon className="size-5 text-muted-foreground" />
                  <CardTitle className="text-base">{item.label}</CardTitle>
                </div>
                {item.description && (
                  <CardDescription>{item.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <Link
                  to={item.url}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Acessar
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma funcionalidade encontrada para &quot;{search}&quot;.
        </div>
      )}
    </div>
  )
}
