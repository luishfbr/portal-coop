import type { LucideIcon } from "lucide-react"

export const DefaultHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) => {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-row items-end gap-2 font-semibold md:text-2xl">
        <Icon className="md:size-10"/>
        <h1>{title}</h1>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
  )
}
