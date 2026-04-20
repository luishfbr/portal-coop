import { ArrowRight, SearchIcon, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "./button"

export default function SearchInput({
  polaceholder,
  onSubmit,
}: {
  polaceholder: string | undefined
  onSubmit: (e: string) => void
}) {
  const [search, setSearch] = useState<string>("")

  return (
    <div className="flex w-full flex-row items-center gap-2">
      <div className="0 relative flex w-full max-w-80 flex-row gap-2">
        <Input
          className="peer ps-9 pe-9"
          placeholder={polaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
      </div>
      {search && (
        <Button
          onClick={() => {
            setSearch("")
            onSubmit("")
          }}
        >
          <X />
        </Button>
      )}
      <Button disabled={!search} onClick={() => onSubmit(search)}>
        <ArrowRight />
      </Button>
    </div>
  )
}
