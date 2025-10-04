"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, Users, Calendar, DollarSign, Trash2, Search } from "lucide-react"
import { exportToPDF, exportToExcel } from "@/lib/export-utils"

interface Document {
  id: string
  fileName: string
  fileType: string
  fileData: string
  nomeFonte: string
  descricao: string
  pagoPor: string
  dataPagamento: string
  valorPago: string
  createdAt: string
  userId: string
}

interface User {
  id: string
  name: string
  lastName: string
  email: string
  base: string
}

export default function AdminReportsPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/login")
      return
    }
    loadData()
  }, [isAuthenticated, isAdmin, router])

  const loadData = () => {
    const allDocuments = JSON.parse(localStorage.getItem("all_documents") || "[]")
    setDocuments(allDocuments)

    const systemUsers = JSON.parse(localStorage.getItem("system_users") || "[]")
    setUsers(systemUsers)
  }

  const handleDeleteDocument = (docId: string) => {
    if (confirm("Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.")) {
      const allDocuments = JSON.parse(localStorage.getItem("all_documents") || "[]")
      const updatedDocuments = allDocuments.filter((doc: Document) => doc.id !== docId)
      localStorage.setItem("all_documents", JSON.stringify(updatedDocuments))
      setDocuments(updatedDocuments)
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.nomeFonte.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.pagoPor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUser = selectedUser === "all" || doc.userId === selectedUser

    let matchesDate = true
    if (startDate || endDate) {
      const docDate = new Date(doc.dataPagamento)
      if (startDate) {
        const start = new Date(startDate)
        matchesDate = matchesDate && docDate >= start
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        matchesDate = matchesDate && docDate <= end
      }
    }

    return matchesSearch && matchesUser && matchesDate
  })

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? `${user.name} ${user.lastName}` : "Usuário não encontrado"
  }

  const totalValue = filteredDocuments.reduce((sum, doc) => sum + Number.parseFloat(doc.valorPago || "0"), 0)

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/admin")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Relatórios do Sistema</h1>
                <p className="text-sm text-gray-600">Visualize e gerencie todos os documentos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredDocuments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  filteredDocuments.filter((doc) => {
                    const docDate = new Date(doc.dataPagamento)
                    const now = new Date()
                    return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear()
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Exportação */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Exportação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por fornecedor, pago por ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Filtrar por Usuário</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos os usuários</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.lastName} ({user.base})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Data Final</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate("")
                    setEndDate("")
                    setSearchTerm("")
                    setSelectedUser("all")
                  }}
                >
                  Limpar Filtros
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={() => exportToPDF(filteredDocuments)}
                    className="flex items-center gap-2"
                    disabled={filteredDocuments.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => exportToExcel(filteredDocuments)}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={filteredDocuments.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Documentos ({filteredDocuments.length})</CardTitle>
            <CardDescription>Gerencie todos os documentos cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum documento encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{doc.nomeFonte}</h3>
                          <Badge variant="outline">{doc.fileType.toUpperCase()}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Usuário:</span> {getUserName(doc.userId)}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>{" "}
                            {new Date(doc.dataPagamento).toLocaleDateString("pt-BR")}
                          </div>
                          <div>
                            <span className="font-medium">Valor:</span> R${" "}
                            {Number.parseFloat(doc.valorPago || "0").toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div>
                            <span className="font-medium">Pago por:</span> {doc.pagoPor}
                          </div>
                        </div>

                        {doc.descricao && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Descrição:</span> {doc.descricao}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
