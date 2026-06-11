"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import type { ModulesProps } from "@/lib/modules-types"
import { MoreHorizontalIcon } from "lucide-react"

export function NavProjects({ modules }: { modules: ModulesProps[] }) {
  const { isMobile } = useSidebar()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Módulos</SidebarGroupLabel>
      <SidebarMenu>
        {modules
          .filter((f) => f.onSidebar === true)
          .map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                render={<a href={item.url} />}
                title={item.label}
              >
                <item.icon />
                {!isMobile && <span>{item.label}</span>}
              </SidebarMenuButton>
              {item.menu && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuAction
                        showOnHover
                        className="aria-expanded:bg-muted"
                      />
                    }
                  >
                    <MoreHorizontalIcon />
                    <span className="sr-only">Menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    {item.menu.map((menu) => (
                      <DropdownMenuItem
                        key={menu.url}
                        render={<a href={menu.url} />}
                      >
                        <menu.icon className="text-muted-foreground" />
                        <span>{menu.label}</span>
                        {menu.requiredPermission && (
                          <Badge variant="outline" className="ml-auto px-1.5 py-0 text-[10px]">
                            {menu.requiredPermission}
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
