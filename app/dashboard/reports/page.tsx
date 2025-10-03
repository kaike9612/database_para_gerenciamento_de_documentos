"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  FileSpreadsheet,
  FileImage,
  DollarSign,
  Building2,
  Calendar,
  TrendingUp,
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
  valorPago: string
  createdAt: string
  userId: string
}

interface ReportData {
  pagoPor: string
  totalPago: number
  documentCount: number
  fontes: string[]
  documentos: Document[]
}

export default function UserReportsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPagoPor, setSelectedPagoPor] = useState<string>("all")
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [filteredData, setFilteredData] = useState<ReportData[]>([])
  const [totalGeral, setTotalGeral] = useState(0)

  // Carregar documentos do usuário
  const loadUserDocuments = () => {
    if (!user?.email) return

    const allDocuments = JSON.parse(localStorage.getItem("all_documents") || "[]")
    const userDocuments = allDocuments.filter((doc: Document) => doc.userId === user.email)
    setDocuments(userDocuments)
  }

  // Processar dados para relatório
  const processReportData = (docs: Document[]) => {
    const groupedData: { [key: string]: ReportData } = {}

    docs.forEach((doc) => {
      const pagoPor = doc.pagoPor || "Não informado"
      const valor = Number.parseFloat(doc.valorPago) || 0

      if (!groupedData[pagoPor]) {
        groupedData[pagoPor] = {
          pagoPor,
          totalPago: 0,
          documentCount: 0,
          fontes: [],
          documentos: [],
        }
      }

      groupedData[pagoPor].totalPago += valor
      groupedData[pagoPor].documentCount += 1
      groupedData[pagoPor].documentos.push(doc)

      if (!groupedData[pagoPor].fontes.includes(doc.nomeFonte)) {
        groupedData[pagoPor].fontes.push(doc.nomeFonte)
      }
    })

    const processedData = Object.values(groupedData).sort((a, b) => b.totalPago - a.totalPago)
    setReportData(processedData)

    const total = processedData.reduce((sum, item) => sum + item.totalPago, 0)
    setTotalGeral(total)
  }

  // Filtrar dados baseado na busca
  const filterData = () => {
    let filtered = reportData

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.pagoPor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.fontes.some((fonte) => fonte.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedPagoPor !== "all") {
      filtered = filtered.filter((item) => item.pagoPor === selectedPagoPor)
    }

    setFilteredData(filtered)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    loadUserDocuments()
  }, [isAuthenticated, router, user])

  useEffect(() => {
    processReportData(documents)
  }, [documents])

  useEffect(() => {
    filterData()
  }, [searchTerm, selectedPagoPor, reportData])

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    const docsToExport = filteredData.flatMap((item) => item.documentos)
    exportToPDF(docsToExport)
  }

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    const docsToExport = filteredData.flatMap((item) => item.documentos)
    exportToExcel(docsToExport)
  }

  const uniquePagoPor = [...new Set(documents.map((doc) => doc.pagoPor))].filter(Boolean)

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
                <p className="text-sm text-gray-600">Análise de pagamentos e fornecedores</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {filteredData.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <FileImage className="h-4 w-4" />
                    PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-2xl font-bold">
                    R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600">Valor Total</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-2xl font-bold">{reportData.length}</p>
                  <p className="text-sm text-gray-600">Empresas Pagadoras</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600 ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-2xl font-bold">{documents.length}</p>
                  <p className="text-sm text-gray-600">Total Documentos</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-2xl font-bold">
                    R${" "}
                    {documents.length > 0
                      ? (totalGeral / documents.length).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                      : "0,00"}
                  </p>
                  <p className="text-sm text-gray-600">Valor Médio</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
            <CardDescription>Filtre os relatórios por empresa pagadora ou busque por fornecedor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Buscar por empresa ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pagoPor">Empresa Pagadora</Label>
                <Select value={selectedPagoPor} onValueChange={setSelectedPagoPor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as empresas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {uniquePagoPor.map((empresa) => (
                      <SelectItem key={empresa} value={empresa}>
                        {empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedPagoPor("all")
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relatório Detalhado */}
        <Card>
          <CardHeader>
            <CardTitle>Relatório por Empresa Pagadora</CardTitle>
            <CardDescription>Detalhamento dos pagamentos por empresa e fornecedores</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
                <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredData.map((item, index) => (
                  <div key={index} className="border rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.pagoPor}</h3>
                        <p className="text-sm text-gray-600">
                          {item.documentCount} documento{item.documentCount !== 1 ? "s" : ""} • {item.fontes.length}{" "}
                          fornecedor{item.fontes.length !== 1 ? "es" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          R$ {item.totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600">Total Pago</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Fornecedores:</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.fontes.map((fonte, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {fonte}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Documentos Recentes:</h4>
                        <div className="space-y-1">
                          {item.documentos.slice(0, 3).map((doc, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              <span className="font-medium">{doc.nomeFonte}</span> - R${" "}
                              {Number.parseFloat(doc.valorPago || "0").toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              -{new Date(doc.dataPagamento).toLocaleDateString("pt-BR")}
                            </div>
                          ))}
                          {item.documentos.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{item.documentos.length - 3} documento{item.documentos.length - 3 !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
