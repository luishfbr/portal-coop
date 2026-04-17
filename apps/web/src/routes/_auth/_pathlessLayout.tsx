import { ToggleTheme } from "@/components/toggle-theme"
import { Logo } from "@/components/ui/logo"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/_pathlessLayout")({
  component: RouteComponent,
  beforeLoad(ctx) {
    if (ctx.context.auth.user && ctx.context.auth.user.twoFactorEnabled) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function RouteComponent() {
  return (
    <div className="mx-auto flex h-screen w-full flex-col items-center justify-center">
      <div className="flex w-full max-w-100 flex-col gap-2">
        <div className="flex w-full flex-row items-center justify-center gap-2">
          <Logo />
          <ToggleTheme size={"icon-lg"} />
        </div>
        <Outlet />
      </div>
      <span className="fixed bottom-2 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} fTech &mdash; Todos os direitos
        reservados.
      </span>
    </div>
  )
}
