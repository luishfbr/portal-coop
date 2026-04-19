import { ArrowRightIcon, SearchIcon } from "lucide-react"
import { useId } from "react"

import { Input } from "@/components/ui/input"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { searchSchema, type SearchType } from "@/lib/validations"
import { Field, FieldGroup } from "./field"

export default function SearchInput({
  polaceholder,
  onSubmit,
}: {
  polaceholder: string | undefined
  onSubmit: (e: string) => void
}) {
  const id = useId()

  const form = useForm<SearchType>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  })

  function submitSearch({ search }: SearchType) {
    if (!search) {
      return
    } else {
      onSubmit(search)
    }
  }

  return (
    <form
      className="0 relative flex w-full max-w-80 flex-row gap-2"
      id="search-form"
      onSubmit={form.handleSubmit(submitSearch)}
      autoComplete="off"
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="search"
          render={({ field, fieldState }) => (
            <Field aria-busy={fieldState.isDirty}>
              <Input
                className="peer ps-9 pe-9"
                id={id}
                placeholder={polaceholder}
                type="search"
                {...field}
              />
            </Field>
          )}
        />
      </FieldGroup>
      <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
        <SearchIcon size={16} />
      </div>
      <button
        aria-label="Submit search"
        className="absolute inset-y-0 inset-e-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        form="search-form"
        disabled={form.formState.disabled || !form.watch("search")}
      >
        <ArrowRightIcon aria-hidden="true" size={16} />
      </button>
    </form>
  )
}
