"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  FileText,
  Calendar,
  Building,
  Eye,
  Download,
  Filter,
  ArrowLeft,
  Trash2,
  FileSpreadsheet,
  FileImage,
} from "lucide-react"
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
  createdAt: string
  userId: string
}

export default function DocumentsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [dateFilter, setDateFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const loadUserDocuments = () => {
    if (!user?.email) return

    const allDocuments = JSON.parse(localStorage.getItem("all_documents") || "[]")
    const userDocuments = allDocuments.filter((doc: Document) => doc.userId === user.email)
    setDocuments(userDocuments)
    setFilteredDocuments(userDocuments)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    loadUserDocuments()
  }, [isAuthenticated, router, user])

  useEffect(() => {
    let filtered = [...documents]

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.nomeFonte.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.pagoPor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((doc) => {
        if (filterType === "pdf") return doc.fileType === "application/pdf"
        if (filterType === "image") return doc.fileType.startsWith("image/")
        return true
      })
    }

    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.dataPagamento + "T00:00:00") // Garantir que seja interpretado como data local
        const docDateOnly = new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate())

        switch (dateFilter) {
          case "today":
            return docDateOnly.getTime() === today.getTime()
          case "week":
            const weekStart = new Date(today)
            weekStart.setDate(today.getDate() - today.getDay())
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 6)
            weekEnd.setHours(23, 59, 59, 999)
            return docDateOnly >= weekStart && docDateOnly <= weekEnd
          case "month":
            return docDateOnly.getMonth() === now.getMonth() && docDateOnly.getFullYear() === now.getFullYear()
          case "year":
            return docDateOnly.getFullYear() === now.getFullYear()
          case "custom":
            if (startDate && endDate) {
              const start = new Date(startDate + "T00:00:00")
              const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
              const end = new Date(endDate + "T00:00:00")
              const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
              endDateOnly.setHours(23, 59, 59, 999)
              return docDateOnly >= startDateOnly && docDateOnly <= endDateOnly
            }
            return true
          default:
            return true
        }
      })
    }

    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === "name") {
        return a.nomeFonte.localeCompare(b.nomeFonte)
      }
      if (sortBy === "company") {
        return a.pagoPor.localeCompare(b.pagoPor)
      }
      return 0
    })

    setFilteredDocuments(filtered)
  }, [documents, searchTerm, filterType, sortBy, dateFilter, startDate, endDate])

  const handleDeleteDocument = (id: string) => {
    const allDocuments = JSON.parse(localStorage.getItem("all_documents") || "[]")
    const updatedAllDocuments = allDocuments.filter((doc: Document) => doc.id !== id)
    localStorage.setItem("all_documents", JSON.stringify(updatedAllDocuments))

    loadUserDocuments()
  }

  const handleDownloadFile = (doc: Document) => {
    const link = document.createElement("a")
    link.href = doc.fileData
    link.download = doc.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    if (filteredDocuments.length === 0) {
      alert("Não há documentos para exportar")
      return
    }
    exportToPDF(filteredDocuments)
  }

  const handleExportExcel = () => {
    if (filteredDocuments.length === 0) {
      alert("Não há documentos para exportar")
      return
    }
    exportToExcel(filteredDocuments)
  }

  const getFileTypeIcon = (fileType: string) => {
    if (fileType === "application/pdf") return "📄"
    if (fileType.startsWith("image/")) return "🖼️"
    return "📎"
  }

  const getFileTypeBadge = (fileType: string) => {
    if (fileType === "application/pdf") return <Badge variant="secondary">PDF</Badge>
    if (fileType.startsWith("image/")) return <Badge variant="outline">Imagem</Badge>
    return <Badge>Arquivo</Badge>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Visualizar Documentos</h1>
                <p className="text-sm text-gray-600">{filteredDocuments.length} documentos encontrados</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportExcel} className="flex items-center gap-2 bg-transparent">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Excel
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2 bg-transparent">
                <FileImage className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros e Busca
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <FileImage className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Filtre os documentos e exporte os resultados em Excel ou PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por nome, empresa, arquivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Arquivo</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Imagens</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Filtrar por Data</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as datas</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                    <SelectItem value="custom">Período personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilter === "custom" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recente</SelectItem>
                    <SelectItem value="oldest">Mais antigo</SelectItem>
                    <SelectItem value="name">Nome da fonte</SelectItem>
                    <SelectItem value="company">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterType("all")
                    setSortBy("newest")
                    setDateFilter("all")
                    setStartDate("")
                    setEndDate("")
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Documentos */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
              <p className="text-gray-600">
                {documents.length === 0
                  ? "Cadastre seu primeiro documento no formulário principal."
                  : "Tente ajustar os filtros de busca."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getFileTypeIcon(doc.fileType)}</span>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-medium truncate">{doc.fileName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">{getFileTypeBadge(doc.fileType)}</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Fonte:</span>
                      <span className="truncate">{doc.nomeFonte}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Pago por:</span>
                      <span className="truncate">{doc.pagoPor}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Data:</span>
                      <span>{new Date(doc.dataPagamento).toLocaleDateString("pt-BR")}</span>
                    </div>

                    {doc.descricao && (
                      <div className="mt-2">
                        <span className="font-medium text-xs text-gray-600">Descrição:</span>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.descricao}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>{doc.fileName}</DialogTitle>
                          <DialogDescription>
                            Cadastrado em {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Nome Fonte:</strong> {doc.nomeFonte}
                            </div>
                            <div>
                              <strong>Pago por:</strong> {doc.pagoPor}
                            </div>
                            <div>
                              <strong>Data do Pagamento:</strong>{" "}
                              {new Date(doc.dataPagamento).toLocaleDateString("pt-BR")}
                            </div>
                            <div>
                              <strong>Tipo:</strong> {doc.fileType}
                            </div>
                          </div>
                          {doc.descricao && (
                            <div>
                              <strong>Descrição:</strong>
                              <p className="mt-1 text-gray-600">{doc.descricao}</p>
                            </div>
                          )}
                          <div className="border rounded-lg p-4 bg-gray-50">
                            {doc.fileType.startsWith("image/") ? (
                              <img
                                src={doc.fileData || "/placeholder.svg"}
                                alt={doc.fileName}
                                className="max-w-full h-auto rounded"
                              />
                            ) : (
                              <div className="text-center py-8">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Arquivo PDF - Use o botão de download para visualizar</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" onClick={() => handleDownloadFile(doc)}>
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
