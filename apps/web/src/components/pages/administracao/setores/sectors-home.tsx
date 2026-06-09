import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { DefaultHeader } from "@/components/ui/header-component"
import { useSectors } from "@/hooks/use-sectors"
import { SectorCreateButton } from "./sector-form"
import { SectorsTable } from "./sectors-table"

export function SectorsHome() {
  const {
    sectors,
    fetchingSectors,
    createSector,
    creatingSector,
    updateSector,
    updatingSector,
    toggleSector,
    togglingSector,
    removeSector,
    removingSector,
    createArea,
    creatingArea,
    updateArea,
    updatingArea,
    toggleArea,
    togglingArea,
    removeArea,
    removingArea,
  } = useSectors()

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Setores e áreas"
        description="Gerencie os setores da cooperativa e suas subdivisões em áreas."
      />
      <div className="flex w-full flex-row items-center gap-2">
        <SectorCreateButton onSubmit={createSector} loading={creatingSector} />
      </div>
      {fetchingSectors ? (
        <LoadingComponent />
      ) : (
        <SectorsTable
          sectors={sectors}
          updateSector={updateSector}
          updatingSector={updatingSector}
          toggleSector={toggleSector}
          togglingSector={togglingSector}
          removeSector={removeSector}
          removingSector={removingSector}
          createArea={createArea}
          creatingArea={creatingArea}
          updateArea={updateArea}
          updatingArea={updatingArea}
          toggleArea={toggleArea}
          togglingArea={togglingArea}
          removeArea={removeArea}
          removingArea={removingArea}
        />
      )}
    </div>
  )
}
