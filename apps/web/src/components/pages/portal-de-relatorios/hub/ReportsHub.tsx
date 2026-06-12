import { LayoutDashboard } from "lucide-react"
import { DefaultHeader } from "@/components/ui/header-component"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { REPORTS_DASHBOARDS } from "@/lib/reports-hub"
import { useActiveDashboards } from "@/hooks/use-reports"
import { DashboardCard } from "./DashboardCard"

const ALL_TAB = "todos"

const categories = [...new Set(REPORTS_DASHBOARDS.map((d) => d.category))]

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  )
}

export function ReportsHub() {
  const { data: activeDashboards, isPending } = useActiveDashboards()

  const activeSlugs = new Set(activeDashboards?.map((d) => d.slug) ?? [])
  const visibleDashboards = REPORTS_DASHBOARDS.filter((d) => activeSlugs.has(d.slug))

  function getDashboardsByCategory(category: string) {
    return visibleDashboards.filter((d) => d.category === category)
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Portal de Relatórios"
        description="Acesse os dashboards disponíveis para o seu perfil."
      />

      {isPending ? (
        <SkeletonGrid />
      ) : visibleDashboards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20 text-center">
          <LayoutDashboard className="size-10 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">Nenhum dashboard disponível</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Nenhum dashboard está ativo para o seu perfil. Entre em contato com o
              administrador.
            </p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue={ALL_TAB}>
          <TabsList>
            <TabsTrigger value={ALL_TAB}>Todos</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Aba Todos */}
          <TabsContent value={ALL_TAB} className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDashboards.map((config) => (
                <DashboardCard key={config.slug} config={config} />
              ))}
            </div>
          </TabsContent>

          {/* Abas por categoria */}
          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getDashboardsByCategory(cat).map((config) => (
                  <DashboardCard key={config.slug} config={config} />
                ))}
                {getDashboardsByCategory(cat).length === 0 && (
                  <p className="col-span-3 py-12 text-center text-sm text-muted-foreground">
                    Nenhum dashboard nesta categoria.
                  </p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
