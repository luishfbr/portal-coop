import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { UserX } from "lucide-react"

export const BanUser = () => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="flex w-full items-center justify-start gap-4"
            variant="ghost"
          >
            <UserX /> Inativar Usuário
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name-1">Name</FieldLabel>
            <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
          </Field>
          <Field>
            <FieldLabel htmlFor="username-1">Username</FieldLabel>
            <Input id="username-1" name="username" defaultValue="@peduarte" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Cancel
              </Button>
            }
          />
          <Field>
            <Button type="submit">Save changes</Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
