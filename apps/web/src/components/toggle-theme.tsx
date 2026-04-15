import { SunIcon, MoonIcon, MonitorIcon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"

const THEME_OPTIONS = [
  { value: "light", label: "Claro", icon: SunIcon },
  { value: "dark", label: "Escuro", icon: MoonIcon },
  { value: "system", label: "Sistema", icon: MonitorIcon },
] as const

export function ToggleTheme() {
  const { theme, setTheme } = useTheme()

  const current =
    THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[2]
  const Icon = current.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Alterar tema"
        title="Alterar tema"
        render={
          <Button variant={"outline"} size={"icon-lg"}>
            <Icon className="size-4" />
          </Button>
        }
      />

      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as typeof theme)}
        >
          {THEME_OPTIONS.map(({ value, label, icon: OptionIcon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <OptionIcon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
