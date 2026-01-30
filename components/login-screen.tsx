"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, User } from "lucide-react"

const HPC_LOGO_URL = "/images/logo-20hpc.png"

export function LoginScreen() {
  const { login, settings } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      const result = login(username, password)
      if (!result.success) {
        setError(result.error || "Login failed")
      }
      setIsLoading(false)
    }, 500)
  }

  const logoUrl = settings.logoUrl || HPC_LOGO_URL

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto flex items-center justify-center w-28 h-28 rounded-2xl bg-white shadow-lg border border-border/50 overflow-hidden p-2">
            <img src={logoUrl || "/placeholder.svg"} alt="HPC Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">{settings.companyName}</CardTitle>
            <p className="text-[#7CB342] italic text-sm font-medium">Care for you</p>
            <CardDescription className="text-base pt-1">{settings.panelName}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Are you an employee?</p>
            <a href="/employee/login" className="text-primary hover:underline font-medium text-sm">Access Employee Portal</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
