import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DashboardConfig } from "@/lib/reports-hub"

interface DashboardCardProps {
  config: DashboardConfig
}

export function DashboardCard({ config }: DashboardCardProps) {
  const Icon = config.icon

  return (
    <Card className="group flex flex-col shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="flex-1">
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <CardTitle className="text-base leading-snug">{config.name}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {config.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Link
          to={config.url}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-2",
          )}
        >
          Acessar
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
