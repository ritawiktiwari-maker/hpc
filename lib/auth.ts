// Authentication utilities for admin panel
export interface AdminSettings {
  companyName: string
  panelName: string
  adminName: string
  logoUrl: string | null
}

export interface AuthState {
  isLoggedIn: boolean
  settings: AdminSettings
}

const AUTH_KEY = "pestcontrol_auth"
const SETTINGS_KEY = "pestcontrol_settings"

// Default credentials
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "Abhay@1995"

const defaultSettings: AdminSettings = {
  companyName: "HPC - Hygiene Pest Control",
  panelName: "Admin Panel",
  adminName: "Admin",
  logoUrl: "/images/logo-20hpc.png",
}

export function getAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, settings: defaultSettings }
  }

  const auth = localStorage.getItem(AUTH_KEY)
  const settings = getSettings()

  return {
    isLoggedIn: auth === "true",
    settings,
  }
}

export function login(username: string, password: string): { success: boolean; error?: string } {
  if (username !== ADMIN_USERNAME) {
    return { success: false, error: "Invalid username" }
  }
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: "Invalid password" }
  }

  localStorage.setItem(AUTH_KEY, "true")
  return { success: true }
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}

export function getSettings(): AdminSettings {
  if (typeof window === "undefined") return defaultSettings

  const stored = localStorage.getItem(SETTINGS_KEY)
  if (!stored) return defaultSettings

  try {
    return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: AdminSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// Employee Authentication
const EMPLOYEE_AUTH_KEY = "pestcontrol_employee_auth"

export function employeeLogin(employeeId: string): void {
  localStorage.setItem(EMPLOYEE_AUTH_KEY, employeeId)
}

export function getEmployeeSession(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(EMPLOYEE_AUTH_KEY)
}

export function employeeLogout(): void {
  localStorage.removeItem(EMPLOYEE_AUTH_KEY)
}
