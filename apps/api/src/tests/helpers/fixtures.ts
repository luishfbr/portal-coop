const BASE_DATE = new Date("2024-01-01T00:00:00.000Z");

export function makeModule(overrides: Record<string, unknown> = {}) {
  return {
    id: "module-1",
    name: "Test Module",
    description: "Test description",
    slug: "test-module",
    icon: "LayoutDashboard",
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeAgency(overrides: Record<string, unknown> = {}) {
  return {
    id: "agency-1",
    name: "Test Agency",
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeSector(overrides: Record<string, unknown> = {}) {
  return {
    id: "sector-1",
    name: "Test Sector",
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    areas: [],
    ...overrides,
  };
}

export function makeArea(overrides: Record<string, unknown> = {}) {
  return {
    id: "area-1",
    sectorId: "sector-1",
    name: "Test Area",
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeJobFunction(overrides: Record<string, unknown> = {}) {
  return {
    id: "jf-1",
    name: "Test Job Function",
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeUserProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: "profile-1",
    userId: "user-1",
    agencyId: null,
    sectorId: null,
    areaId: null,
    jobFunctionId: null,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: "user",
    ...overrides,
  };
}

export function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    user: makeUser(overrides),
    session: { id: "session-1", userId: "user-1", token: "test-token" },
  };
}

export function makeAdminSession() {
  return makeSession({ role: "admin" });
}

export function makeGroup(overrides: Record<string, unknown> = {}) {
  return {
    id: "group-1",
    name: "Test Group",
    slug: "test-group",
    description: null,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makePermission(overrides: Record<string, unknown> = {}) {
  return {
    id: "perm-1",
    moduleId: "module-1",
    slug: "view",
    name: "Visualizar",
    description: null,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeUserGroup(overrides: Record<string, unknown> = {}) {
  return {
    id: "ug-1",
    userId: "user-1",
    groupId: "group-1",
    createdAt: BASE_DATE,
    ...overrides,
  };
}

export function makeIndicator(overrides: Record<string, unknown> = {}) {
  return {
    id: "indicator-1",
    name: "Test Indicator",
    slug: "test-indicator",
    description: null,
    sectorId: null,
    sector: null,
    categoria: "metas_comerciais" as const,
    direcao: "crescente" as const,
    periodicidade: "mensal" as const,
    defasagem: 0,
    metodoConsolidacao: "acumulado" as const,
    unidadeMedida: "inteiro" as const,
    isActive: true,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeIndicatorValue(overrides: Record<string, unknown> = {}) {
  return {
    id: "value-1",
    indicatorId: "indicator-1",
    type: "realizado" as const,
    value: 100,
    referenceDate: "2024-01-01",
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

