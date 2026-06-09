import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { DefaultHeader } from "@/components/ui/header-component"
import { useJobFunctions } from "@/hooks/use-job-functions"
import { JobFunctionCreateButton } from "./job-function-form"
import { JobFunctionsTable } from "./job-functions-table"

export function JobFunctionsHome() {
  const {
    jobFunctions,
    fetchingJobFunctions,
    createJobFunction,
    creatingJobFunction,
    updateJobFunction,
    updatingJobFunction,
    toggleJobFunction,
    togglingJobFunction,
    removeJobFunction,
    removingJobFunction,
  } = useJobFunctions()

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <DefaultHeader
        title="Funções e cargos"
        description="Gerencie as funções e cargos disponíveis na cooperativa."
      />
      <div className="flex w-full flex-row items-center gap-2">
        <JobFunctionCreateButton onSubmit={createJobFunction} loading={creatingJobFunction} />
      </div>
      {fetchingJobFunctions ? (
        <LoadingComponent />
      ) : (
        <JobFunctionsTable
          jobFunctions={jobFunctions}
          updateJobFunction={updateJobFunction}
          updatingJobFunction={updatingJobFunction}
          toggleJobFunction={toggleJobFunction}
          togglingJobFunction={togglingJobFunction}
          removeJobFunction={removeJobFunction}
          removingJobFunction={removingJobFunction}
        />
      )}
    </div>
  )
}
