import { Goal } from "lucide-react"
import { Button } from "./button"
import { Field } from "./field"

export const Logo = () => {
  return (
    <Field orientation={"responsive"}>
      <Button variant={"outline"} size={"lg"} disabled>
        <Goal />
        <span className="font-semibold">Portal Coop - Empresa Parceira</span>
      </Button>
    </Field>
  )
}
