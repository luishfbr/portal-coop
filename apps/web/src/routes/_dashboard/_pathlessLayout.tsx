import { AppSidebar } from "@/components/app-sidebar"
import {
  EnableTwoFactorPage,
  UnauthorizedPage,
} from "@/components/customs-pages/errors-page"
import { ToggleTheme } from "@/components/toggle-theme"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { modules } from "@/lib/modules-types"
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router"
import { Cog } from "lucide-react"

export const Route = createFileRoute("/_dashboard/_pathlessLayout")({
  component: RouteComponent,
})

function RouteComponent() {
  const path = useRouterState().location.pathname
  const router = useRouter()
  const navigate = useNavigate()
  const user = router.options.context.auth.user

  if (!user) {
    return <UnauthorizedPage />
  } else if (!user.twoFactorEnabled) {
    return <EnableTwoFactorPage />
  } else {
    return (
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 flex-row items-center justify-between gap-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2" />
              <Breadcrumb>
                {(() => {
                  const direct = modules.find((m) => m.url === path)
                  if (direct) {
                    return (
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbPage>{direct.label}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    )
                  }

                  for (const module of modules) {
                    const menuItem = module.menu?.find((m) => m.url === path)
                    if (menuItem) {
                      return (
                        <BreadcrumbList>
                          <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href={module.url}>
                              {module.label}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator className="hidden md:block" />
                          <BreadcrumbItem>
                            <BreadcrumbPage>{menuItem.label}</BreadcrumbPage>
                          </BreadcrumbItem>
                        </BreadcrumbList>
                      )
                    }
                  }

                  for (const module of modules) {
                    for (const menuItem of module.menu ?? []) {
                      const subItem = menuItem.submenu?.find((s) =>
                        s.pattern.test(path),
                      )
                      if (subItem) {
                        return (
                          <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                              <BreadcrumbLink href={module.url}>
                                {module.label}
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem className="hidden md:block">
                              <BreadcrumbLink href={menuItem.url}>
                                {menuItem.label}
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                              <BreadcrumbPage>{subItem.label}</BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        )
                      }
                    }
                  }

                  return null
                })()}
              </Breadcrumb>
            </div>
            <div className="flex flex-row items-center gap-2">
              <ToggleTheme size={"icon"} />
              {user.role === "admin" && (
                <Button
                  variant={"outline"}
                  onClick={() => {
                    navigate({
                      to: "/administracao",
                    })
                  }}
                >
                  <Cog />
                  <span className="hidden md:flex">Administração</span>
                </Button>
              )}
            </div>
          </header>
          <Separator />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="mx-auto h-full w-full md:max-w-7xl">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }
}
