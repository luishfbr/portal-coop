import { DefaultHeader } from "@/components/ui/header-component"
import { useModulesAdmin } from "@/hooks/use-modules-admin"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { ModulesTable } from "./modules-table"

export function ModulesHome() {
  const { modules, fetchingModules, toggleModule, togglingModule } = useModulesAdmin()

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Módulos do sistema"
        description="Ative ou desative módulos para controlar o acesso dos usuários às funcionalidades."
      />
      {fetchingModules ? (
        <LoadingComponent />
      ) : (
        <ModulesTable
          modules={modules}
          toggleModule={toggleModule}
          togglingModule={togglingModule}
        />
      )}
    </div>
  )
}
