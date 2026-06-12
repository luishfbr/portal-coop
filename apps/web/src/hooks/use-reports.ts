import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/axios-client"
import type { DashboardConfigType, MonthlyDataType } from "@/lib/validations"
import type { IndicatorCategory } from "@/lib/reports/vg-indicators"

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActiveDashboard = {
  id: string
  slug: string
  isActive: boolean
  visibility: "all" | "sectors"
  sectorIds: string[]
  createdAt: string
  updatedAt: string
}

export type AdminDashboard = {
  id: string | null
  slug: string
  isActive: boolean
  visibility: "all" | "sectors"
  sectorIds: string[]
  createdAt: string | null
  updatedAt: string | null
}

export type VGIndicatorData = {
  slug: string
  name: string
  description: string
  unit: "MOEDA" | "PORCENTAGEM" | "INTEIRO"
  direction: "CRESCENTE" | "DECRESCENTE" | "FIXO"
  categories: IndicatorCategory[]
  consolidatedTarget: number | null
  consolidatedRealized: number | null
  achievementRate: number | null
  isCritical: boolean | null
  monthlyData: { month: number; target: number | null; realized: number | null }[]
}

export type VGMonthlyData = {
  indicatorSlug: string
  year: number
  months: { month: number; value: number | null }[]
}

// ── Query key factory ─────────────────────────────────────────────────────────

export const reportsKeys = {
  all: () => ["reports"] as const,
  active: () => [...reportsKeys.all(), "active"] as const,
  admin: () => [...reportsKeys.all(), "admin"] as const,
  vg: {
    all: () => [...reportsKeys.all(), "vg"] as const,
    data: (year: number, month?: number) =>
      [...reportsKeys.vg.all(), "data", year, month] as const,
    targets: (slug: string, year: number) =>
      [...reportsKeys.vg.all(), "targets", slug, year] as const,
    realized: (slug: string, year: number) =>
      [...reportsKeys.vg.all(), "realized", slug, year] as const,
  },
}

// ── queryOptions (para integração com loaders do TanStack Router) ─────────────

export function activeDashboardsQueryOptions() {
  return queryOptions({
    queryKey: reportsKeys.active(),
    queryFn: () =>
      api.get<ActiveDashboard[]>("/reports/dashboards/active").then((r) => r.data),
    staleTime: 1000 * 60 * 30,
  })
}

export function vgDataQueryOptions(year: number, month?: number) {
  return queryOptions({
    queryKey: reportsKeys.vg.data(year, month),
    queryFn: () => {
      const params: Record<string, string> = { year: String(year) }
      if (month) params.month = String(month)
      return api.get<VGIndicatorData[]>("/reports/visao-geral", { params }).then((r) => r.data)
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ── Hooks de usuário ──────────────────────────────────────────────────────────

export function useActiveDashboards() {
  return useQuery(activeDashboardsQueryOptions())
}

export function useVGData(year: number, month?: number) {
  return useQuery(vgDataQueryOptions(year, month))
}

// ── Hooks de admin — dashboards ───────────────────────────────────────────────

export function useAdminDashboards() {
  return useQuery({
    queryKey: reportsKeys.admin(),
    queryFn: () =>
      api.get<AdminDashboard[]>("/reports/dashboards").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useConfigureDashboard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, ...data }: DashboardConfigType & { slug: string }) =>
      api.patch(`/reports/dashboards/${slug}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reportsKeys.admin() })
      qc.invalidateQueries({ queryKey: reportsKeys.active() })
      toast.success("Dashboard atualizado.")
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Hooks de admin — metas e realizados ──────────────────────────────────────

export function useVGTargets(indicatorSlug: string | null, year: number) {
  return useQuery({
    queryKey: reportsKeys.vg.targets(indicatorSlug ?? "", year),
    queryFn: () =>
      api
        .get<VGMonthlyData>(`/reports/visao-geral/targets/${indicatorSlug}/${year}`)
        .then((r) => r.data),
    staleTime: 1000 * 60 * 10,
    enabled: !!indicatorSlug && !!year,
  })
}

export function useVGRealized(indicatorSlug: string | null, year: number) {
  return useQuery({
    queryKey: reportsKeys.vg.realized(indicatorSlug ?? "", year),
    queryFn: () =>
      api
        .get<VGMonthlyData>(`/reports/visao-geral/realized/${indicatorSlug}/${year}`)
        .then((r) => r.data),
    staleTime: 1000 * 60 * 10,
    enabled: !!indicatorSlug && !!year,
  })
}

type UpsertPayload = {
  slug: string
  year: number
  entries: MonthlyDataType["months"]
}

export function useUpsertVGTargets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, year, entries }: UpsertPayload) =>
      api
        .put(`/reports/visao-geral/targets/${slug}/${year}`, { entries })
        .then((r) => r.data),
    onSuccess: (_, { slug, year }) => {
      qc.invalidateQueries({ queryKey: reportsKeys.vg.targets(slug, year) })
      qc.invalidateQueries({ queryKey: reportsKeys.vg.data(year) })
      toast.success("Metas salvas com sucesso.")
    },
    onError: (err) => toast.error(err.message),
  })
}

export function useUpsertVGRealized() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, year, entries }: UpsertPayload) =>
      api
        .put(`/reports/visao-geral/realized/${slug}/${year}`, { entries })
        .then((r) => r.data),
    onSuccess: (_, { slug, year }) => {
      qc.invalidateQueries({ queryKey: reportsKeys.vg.realized(slug, year) })
      qc.invalidateQueries({ queryKey: reportsKeys.vg.data(year) })
      toast.success("Realizados salvos com sucesso.")
    },
    onError: (err) => toast.error(err.message),
  })
}
