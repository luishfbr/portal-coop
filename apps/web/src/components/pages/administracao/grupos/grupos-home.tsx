import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { DefaultHeader } from "@/components/ui/header-component"
import { useGroups } from "@/hooks/use-groups"
import { GruposTable } from "./grupos-table"

export function GruposHome() {
  const { groups, fetchingGroups, setGroupUsers, settingGroupUsers } = useGroups()

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Grupos de acesso"
        description="Visualize grupos de acesso e gerencie quais usuários pertencem a cada grupo."
      />
      {fetchingGroups ? (
        <LoadingComponent />
      ) : (
        <GruposTable
          groups={groups}
          setGroupUsers={setGroupUsers}
          settingGroupUsers={settingGroupUsers}
        />
      )}
    </div>
  )
}
