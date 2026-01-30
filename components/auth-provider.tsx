"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type AuthState,
  type AdminSettings,
  getAuthState,
  login as authLogin,
  logout as authLogout,
  saveSettings,
} from "@/lib/auth"

interface AuthContextType {
  isLoggedIn: boolean
  settings: AdminSettings
  login: (username: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  updateSettings: (settings: AdminSettings) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    settings: {
      companyName: "HPC - Hygiene Pest Control",
      panelName: "Admin Panel",
      adminName: "Admin",
      logoUrl: "/images/logo-20hpc.png",
    },
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const state = getAuthState()
    setAuthState(state)
    setIsLoading(false)
  }, [])

  const handleLogin = (username: string, password: string) => {
    const result = authLogin(username, password)
    if (result.success) {
      setAuthState((prev) => ({ ...prev, isLoggedIn: true }))
    }
    return result
  }

  const handleLogout = () => {
    authLogout()
    setAuthState((prev) => ({ ...prev, isLoggedIn: false }))
  }

  const updateSettings = (newSettings: AdminSettings) => {
    saveSettings(newSettings)
    setAuthState((prev) => ({ ...prev, settings: newSettings }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: authState.isLoggedIn,
        settings: authState.settings,
        login: handleLogin,
        logout: handleLogout,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
