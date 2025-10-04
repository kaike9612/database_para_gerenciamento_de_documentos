"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus, ArrowLeft } from "lucide-react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  base: string
  password: string
  createdAt: string
}

const BASES = ["Lauro de Freitas", "Barros Reis", "Feira de São Joaquim", "Galpão"]

export default function UsersManagementPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    base: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/login")
      return
    }
    loadUsers()
  }, [isAuthenticated, isAdmin, router])

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem("system_users") || "[]")

    const defaultUsers = [
      {
        id: "default-marlene",
        firstName: "Marlene",
        lastName: "Santos",
        email: "marlene@laticiniossantana.com.br",
        base: "Lauro de Freitas",
        password: "221224Ls",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "default-br",
        firstName: "BR",
        lastName: "User",
        email: "br@laticiniossantana.com.br",
        base: "Barros Reis",
        password: "221224Ls",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "default-fsj",
        firstName: "FSJ",
        lastName: "User",
        email: "fsj@laticiniossantana.com.br",
        base: "Feira de São Joaquim",
        password: "221224Ls",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "default-admin",
        firstName: "Admin",
        lastName: "User",
        email: "admin@laticiniossantana.com.br",
        base: "Galpão",
        password: "admin123Ls",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "default-jane",
        firstName: "Jane",
        lastName: "Silva",
        email: "jane@laticiniossantana.com.br",
        base: "Lauro de Freitas",
        password: "221224Ls",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]

    const existingEmails = savedUsers.map((user: User) => user.email)
    const usersToAdd = defaultUsers.filter((user) => !existingEmails.includes(user.email))

    if (usersToAdd.length > 0) {
      const updatedUsers = [...usersToAdd, ...savedUsers]
      localStorage.setItem("system_users", JSON.stringify(updatedUsers))
      setUsers(updatedUsers)
    } else {
      setUsers(savedUsers)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.base || !formData.password) {
      setError("Todos os campos são obrigatórios")
      return
    }

    const existingUsers = JSON.parse(localStorage.getItem("system_users") || "[]")

    if (editingUser) {
      // Editando usuário existente
      const updatedUsers = existingUsers.map((user: User) =>
        user.id === editingUser.id ? { ...user, ...formData } : user,
      )
      localStorage.setItem("system_users", JSON.stringify(updatedUsers))
      setSuccess("Usuário atualizado com sucesso!")
    } else {
      // Verificar se email já existe
      if (existingUsers.some((user: User) => user.email === formData.email)) {
        setError("Este email já está em uso")
        return
      }

      // Criando novo usuário
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      }

      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem("system_users", JSON.stringify(updatedUsers))
      setSuccess("Usuário criado com sucesso!")
    }

    loadUsers()
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      base: "",
      password: "",
    })
    setEditingUser(null)
    setError("")
    setSuccess("")
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      base: user.base,
      password: user.password,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      const existingUsers = JSON.parse(localStorage.getItem("system_users") || "[]")
      const updatedUsers = existingUsers.filter((user: User) => user.id !== userId)
      localStorage.setItem("system_users", JSON.stringify(updatedUsers))
      loadUsers()
      setSuccess("Usuário excluído com sucesso!")
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => router.push("/admin")} className="flex items-center gap-2 mr-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Gerenciamento de Usuários</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Usuários do Sistema</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar Usuário" : "Criar Novo Usuário"}</DialogTitle>
                <DialogDescription>
                  {editingUser ? "Edite as informações do usuário" : "Preencha os dados para criar um novo usuário"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base">Base</Label>
                  <Select value={formData.base} onValueChange={(value) => setFormData({ ...formData, base: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma base" />
                    </SelectTrigger>
                    <SelectContent>
                      {BASES.map((base) => (
                        <SelectItem key={base} value={base}>
                          {base}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingUser ? "Atualizar" : "Criar"} Usuário
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>Gerencie todos os usuários do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum usuário cadastrado ainda.</p>
                <p className="text-sm">Clique em "Novo Usuário" para começar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.base}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
