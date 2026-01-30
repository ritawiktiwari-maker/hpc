"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-provider"
import { SettingsDialog } from "./settings-dialog"
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  ClipboardCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/jobs", label: "Job Assignment", icon: ClipboardList },
  { href: "/admin/stock-approvals", label: "Stock Approvals", icon: ClipboardCheck },
  { href: "/admin/reports", label: "Reports", icon: ClipboardList },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { settings, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7CB342] to-[#42A5F5]" />
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white overflow-hidden shadow-sm">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl || "/placeholder.svg"}
                alt="Logo"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#7CB342] to-[#42A5F5]" />
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate">{settings.companyName}</span>
              <span className="text-xs text-sidebar-foreground/70 truncate">{settings.panelName}</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5 h-auto text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={settings.logoUrl || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-[#7CB342] to-[#42A5F5] text-white text-xs">
                    {settings.adminName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium truncate">Hello {settings.adminName},</span>
                    <span className="text-xs text-sidebar-foreground/60">Administrator</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
