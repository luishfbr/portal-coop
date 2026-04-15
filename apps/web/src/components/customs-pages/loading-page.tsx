import { Spinner } from "../ui/spinner"

export const LoadingPage = () => {
  return (
    <div className="mx-auto flex h-screen w-full items-center justify-center">
      <Spinner />
    </div>
  )
}
