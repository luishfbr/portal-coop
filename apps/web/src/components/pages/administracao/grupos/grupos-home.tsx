import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { DefaultHeader } from "@/components/ui/header-component"
import { useGroups } from "@/hooks/use-groups"
import { GrupoCreateButton } from "./grupo-form"
import { GruposTable } from "./grupos-table"

export function GruposHome() {
  const {
    groups,
    fetchingGroups,
    createGroup,
    creatingGroup,
    updateGroup,
    updatingGroup,
    removeGroup,
    removingGroup,
    setGroupModules,
    settingGroupModules,
    setGroupUsers,
    settingGroupUsers,
  } = useGroups()

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Grupos de acesso"
        description="Gerencie grupos de usuários e controle quais módulos cada grupo pode acessar."
      />
      <div className="flex items-center justify-end">
        <GrupoCreateButton onSubmit={createGroup} loading={creatingGroup} />
      </div>
      {fetchingGroups ? (
        <LoadingComponent />
      ) : (
        <GruposTable
          groups={groups}
          updateGroup={updateGroup}
          updatingGroup={updatingGroup}
          removeGroup={removeGroup}
          removingGroup={removingGroup}
          setGroupModules={setGroupModules}
          settingGroupModules={settingGroupModules}
          setGroupUsers={setGroupUsers}
          settingGroupUsers={settingGroupUsers}
        />
      )}
    </div>
  )
}
