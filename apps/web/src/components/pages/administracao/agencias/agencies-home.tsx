import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { DefaultHeader } from "@/components/ui/header-component"
import { useAgencies } from "@/hooks/use-agencies"
import { AgenciesTable } from "./agencies-table"
import { AgencyCreateButton } from "./agency-form"

export function AgenciesHome() {
  const {
    agencies,
    fetchingAgencies,
    createAgency,
    creatingAgency,
    updateAgency,
    updatingAgency,
    toggleAgency,
    togglingAgency,
    removeAgency,
    removingAgency,
  } = useAgencies()

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Agências e unidades"
        description="Gerencie as agências, unidades e postos de atendimento da cooperativa."
      />
      <div className="flex w-full flex-row items-center gap-2">
        <AgencyCreateButton onSubmit={createAgency} loading={creatingAgency} />
      </div>
      {fetchingAgencies ? (
        <LoadingComponent />
      ) : (
        <AgenciesTable
          agencies={agencies}
          updateAgency={updateAgency}
          updatingAgency={updatingAgency}
          toggleAgency={toggleAgency}
          togglingAgency={togglingAgency}
          removeAgency={removeAgency}
          removingAgency={removingAgency}
        />
      )}
    </div>
  )
}
