import {
  Cog,
  Home,
  Sheet,
  Shredder,
  Upload,
  type LucideIcon,
} from "lucide-react"

export interface ModulesProps {
  label: string
  url: string
  icon: LucideIcon
  onSidebar: boolean
  menu:
    | {
        label: string
        url: string
        icon: LucideIcon
        description: string
      }[]
    | null
}

export const modules: ModulesProps[] = [
  {
    label: "Página Inicial",
    url: "/pagina-inicial",
    icon: Home,
    onSidebar: true,
    menu: null,
  },
  {
    label: "Governança Analítica",
    url: "/governanca-analitica",
    icon: Sheet,
    onSidebar: true,
    menu: [
      {
        label: "Atualizar Relatórios",
        url: "/governanca-analitica/atualizar-relatorios",
        icon: Upload,
        description: "",
      },
      {
        label: "Formatar Planilha",
        url: "/governanca-analitica/formatar-planilha",
        icon: Shredder,
        description: "",
      },
    ],
  },
  {
    label: "Painel de Administração",
    url: "/administracao",
    icon: Cog,
    onSidebar: false,
    menu: [
      {
        label: "Usuários",
        url: "/administracao/usuarios",
        icon: Upload,
        description:
          "Gerencie os usuários do sistema: cadastre novos membros, edite dados cadastrais, redefina senhas e desative contas.",
      },
    ],
  },
]
