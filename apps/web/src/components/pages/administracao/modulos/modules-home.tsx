import { DefaultHeader } from "@/components/ui/header-component"
import { useModulesAdmin } from "@/hooks/use-modules-admin"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { ModulesTable } from "./modules-table"

export function ModulesHome() {
  const { modules, fetchingModules } = useModulesAdmin()

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Módulos do sistema"
        description="Catálogo de módulos disponíveis. O acesso é controlado via grupos de usuários."
      />
      {fetchingModules ? (
        <LoadingComponent />
      ) : (
        <ModulesTable modules={modules} />
      )}
    </div>
  )
}
