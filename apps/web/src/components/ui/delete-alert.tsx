import { Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog"
import { Button } from "./button"

export const DeleteAlert = ({
  onAccept,
  label,
  disabled,
  variant,
}: {
  onAccept: () => void
  label: string
  variant:
    | "link"
    | "default"
    | "destructive"
    | "destructive-outline"
    | "ghost"
    | "outline"
    | "secondary"
    | null
    | undefined
  disabled: boolean
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant={variant}
            disabled={disabled}
            className="flex w-full flex-row items-center justify-start gap-4 bg-red-600/5"
          >
            <Trash /> {label}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é permanente e não pode ser desfeita. O item selecionado e
            todos os registros relacionados serão excluídos. Se preferir, considere
            desabilitar o item em vez de excluí-lo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
