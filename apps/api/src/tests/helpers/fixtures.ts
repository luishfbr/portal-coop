const BASE_DATE = new Date("2024-01-01T00:00:00.000Z");

export function makeModule(overrides: Record<string, unknown> = {}) {
  return {
    id: "module-1",
    name: "Test Module",
    description: "Test description",
    slug: "test-module",
    icon: "LayoutDashboard",
    isActive: true,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeAgency(overrides: Record<string, unknown> = {}) {
  return {
    id: "agency-1",
    name: "Test Agency",
    description: "Test description",
    isActive: true,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeSector(overrides: Record<string, unknown> = {}) {
  return {
    id: "sector-1",
    name: "Test Sector",
    description: "Test description",
    isActive: true,
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
    description: "Test description",
    isActive: true,
    createdAt: BASE_DATE,
    updatedAt: BASE_DATE,
    ...overrides,
  };
}

export function makeJobFunction(overrides: Record<string, unknown> = {}) {
  return {
    id: "jf-1",
    name: "Test Job Function",
    description: "Test description",
    isActive: true,
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
