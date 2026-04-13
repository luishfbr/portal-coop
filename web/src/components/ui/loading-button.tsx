import { Button } from "./button"
import { Spinner } from "./spinner"

export const LoadingButton = ({
  disabled,
  form,
  label,
  loading,
}: {
  loading: boolean
  disabled: boolean
  label: string
  form: string
}) => {
  return (
    <Button disabled={disabled || loading} form={form} type="submit">
      {!loading ? label : <Spinner />}
    </Button>
  )
}
