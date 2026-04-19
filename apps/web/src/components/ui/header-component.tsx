export const DefaultHeader = ({
  title,
  description,
}: {
  title: string
  description: string
}) => {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="font-bold md:text-3xl">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
  )
}
