"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  email: string
  role: "admin" | "user"
  name?: string
  base?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  user: User | null
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const ADMIN_EMAIL = "admin@exemplo.com"
  const ADMIN_PASSWORD = "123456"
  const ADMIN2_EMAIL = "ti@exemplo.com"
  const ADMIN2_PASSWORD = "123456"
  const USER_EMAIL = "usuario@exemplo.com"
  const USER_PASSWORD = "123456"
  const USER2_EMAIL = "user@exemplo.com"
  const USER2_PASSWORD = "123456"

  useEffect(() => {
    const savedAuth = localStorage.getItem("auth")
    if (savedAuth) {
      const authData = JSON.parse(savedAuth)
      setIsAuthenticated(true)
      setUser(authData.user)
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    let userData: User | null = null

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      userData = { email, role: "admin", name: "Administrador" }
    } else if (email === ADMIN2_EMAIL && password === ADMIN2_PASSWORD) {
      userData = { email, role: "admin", name: "Administrador TI" }
    } else if (email === USER_EMAIL && password === USER_PASSWORD) {
      userData = { email, role: "user", name: "Usuário Padrão" }
    } else if (email === USER2_EMAIL && password === USER2_PASSWORD) {
      userData = { email, role: "user", name: "Usuário Comum" }
    } else {
      const users = JSON.parse(localStorage.getItem("system_users") || "[]")
      const foundUser = users.find((u: any) => u.email === email && u.password === password)
      if (foundUser) {
        userData = {
          email: foundUser.email,
          role: "user",
          name: `${foundUser.firstName} ${foundUser.lastName}`,
          base: foundUser.base,
        }
      }
    }

    if (userData) {
      const authData = {
        isAuthenticated: true,
        user: userData,
      }
      localStorage.setItem("auth", JSON.stringify(authData))
      setIsAuthenticated(true)
      setUser(userData)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("auth")
    setIsAuthenticated(false)
    setUser(null)
  }

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, isAdmin }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
