import {
  Briefcase,
  Building2,
  Cog,
  Home,
  LayoutDashboard,
  Layers,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react"

export interface ModulesProps {
  label: string
  url: string
  icon: LucideIcon
  onSidebar: boolean
  /** false = sempre visível (não depende de grupo); true = controlado por RBAC */
  gated: boolean
  menu:
    | {
        label: string
        url: string
        icon: LucideIcon
        description: string
        requiredPermission?: string
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
    gated: false,
    menu: null,
  },
  {
    label: "Painel de Administração",
    url: "/administracao",
    icon: Cog,
    onSidebar: false,
    gated: false,
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
          "Visualize o catálogo de módulos do sistema e as permissões disponíveis em cada um.",
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
      {
        label: "Grupos",
        url: "/administracao/grupos",
        icon: Shield,
        description:
          "Visualize grupos de acesso e gerencie quais usuários pertencem a cada grupo.",
      },
    ],
  },
]
