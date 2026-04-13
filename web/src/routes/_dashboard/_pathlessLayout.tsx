import { AppSidebar } from "@/components/app-sidebar"
import {
  EnableTwoFactorPage,
  UnauthorizedPage,
} from "@/components/customs-pages/errors-page"
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
import { authClient } from "@/lib/auth-client"
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/_pathlessLayout")({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const user = router.options.context.auth.user
  const navigate = useNavigate()

  if (!user) {
    return <UnauthorizedPage />
  } else if (!user.twoFactorEnabled) {
    return <EnableTwoFactorPage />
  } else {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Build Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }
}
