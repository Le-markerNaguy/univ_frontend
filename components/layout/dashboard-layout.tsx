"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { checkAuth, logout } from "@/lib/auth"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyAuth = async () => {
      const userData = await checkAuth()
      console.log("[v0] Réponse complète de l'API /me:", userData)
      console.log("[v0] Type de userData:", typeof userData)
      console.log("[v0] Clés de userData:", userData ? Object.keys(userData) : "userData est null/undefined")

      if (userData && userData.user) {
        console.log("[v0] userData.user:", userData.user)
        console.log("[v0] Type de userData.user:", typeof userData.user)
        console.log("[v0] Clés de userData.user:", Object.keys(userData.user))
        console.log("[v0] Rôle de l'utilisateur:", userData.user.role)
        console.log("[v0] Type du rôle:", typeof userData.user.role)
        setUser(userData.user)
      } else {
        console.log("[v0] Pas de userData.user, redirection vers /")
        router.push("/")
      }
      setLoading(false)
    }

    verifyAuth()
  }, [router])

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground capitalize">
                {user?.role ? user.role.toLowerCase().replace("_", " ") : "Rôle en cours de chargement..."}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.nom ? user.nom.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem className="flex items-center cursor-default">
                  <Avatar className="mr-2 h-4 w-4">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.nom ? user.nom.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.nom || "Utilisateur"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
