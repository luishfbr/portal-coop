"use client"

import * as React from "react"

import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useActiveModules } from "@/hooks/use-active-modules"
import { LifeBuoyIcon, SendIcon, Goal } from "lucide-react"
import { modules } from "@/lib/modules-types"
import type { User } from "@/auth"

const data = {
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoyIcon />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <SendIcon />,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { activeSlugs, isPending } = useActiveModules()

  const visibleModules = activeSlugs
    ? modules.filter((m) => activeSlugs.includes(m.url.slice(1)))
    : modules

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Goal className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Portal Coop</span>
                <span className="truncate text-xs">Sicoob Uberaba</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isPending ? (
          <SidebarGroup>
            <SidebarGroupLabel>Módulos</SidebarGroupLabel>
            <SidebarMenu>
              {Array.from({ length: 3 }).map((_, i) => (
                <SidebarMenuItem key={i}>
                  <Skeleton className="h-8 w-full rounded-md" />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          <NavProjects modules={visibleModules} />
        )}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
