import {
  Briefcase,
  Building2,
  Cog,
  Home,
  LayoutDashboard,
  Layers,
  Sheet,
  Shredder,
  Upload,
  Users,
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
        submenu?: {
          label: string
          pattern: RegExp
        }[]
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
        icon: Users,
        description:
          "Gerencie os usuários do sistema: cadastre novos membros, edite dados cadastrais, redefina senhas e desative contas.",
        submenu: [
          {
            label: "Editar Usuário",
            pattern: /^\/administracao\/usuario\/[^/]+$/,
          },
        ],
      },
      {
        label: "Módulos",
        url: "/administracao/modulos",
        icon: LayoutDashboard,
        description:
          "Ative ou desative módulos para controlar quais funcionalidades ficam visíveis no sistema.",
      },
      {
        label: "Agências",
        url: "/administracao/agencias",
        icon: Building2,
        description:
          "Gerencie as agências, unidades e postos de atendimento da cooperativa.",
      },
      {
        label: "Setores",
        url: "/administracao/setores",
        icon: Layers,
        description:
          "Gerencie os setores da cooperativa e suas subdivisões em áreas.",
      },
      {
        label: "Funções",
        url: "/administracao/funcoes",
        icon: Briefcase,
        description:
          "Gerencie as funções e cargos disponíveis na cooperativa.",
      },
    ],
  },
]
