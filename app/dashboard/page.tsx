"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, LogOut, Eye, BarChart3, FileSpreadsheet, FileImage } from "lucide-react"
import { exportToPDF, exportToExcel } from "@/lib/export-utils"
import FileUpload from "@/components/file-upload"

interface Document {
  id: string
  fileName: string
  fileType: string
  fileData: string
  nomeFonte: string
  descricao: string
  pagoPor: string
  dataPagamento: string
  valorPago: string // adicionado campo valor pago
  createdAt: string
  userId: string
}

interface FieldConfig {
  name: string
  label: string
  required: boolean
  visible: boolean
}

export default function DashboardPage() {
  const { isAuthenticated, logout, user } = useAuth()
  const router = useRouter()

  const [fieldConfig, setFieldConfig] = useState<FieldConfig[]>([])

  const [formData, setFormData] = useState({
    nomeFonte: "",
    descricao: "",
    pagoPor: "",
    dataPagamento: "",
    valorPago: "", // adicionado campo valor pago no estado
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [documents, setDocuments] = useState<Document[]>([])
  const [fileError, setFileError] = useState("")

  // Função para carregar documentos filtrados por usuário
  const loadUserDocuments = () => {
    if (!user?.email) return

    const allDocuments = JSON.parse(localStorage.getItem("all_documents") || "[]")
    const userDocuments = allDocuments.filter((doc: Document) => doc.userId === user.email)
    setDocuments(userDocuments)
  }

  // Função para salvar documento com userId
  const saveDocument = (newDocument: Document) => {
    const allDocuments = JSON.parse(localStorage.getItem("all_documents") || "[]")
    const updatedAllDocuments = [...allDocuments, newDocument]
    localStorage.setItem("all_documents", JSON.stringify(updatedAllDocuments))

    // Atualizar documentos do usuário atual
    loadUserDocuments()
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Carregar documentos do usuário específico
    loadUserDocuments()

    const savedConfig = localStorage.getItem("form_field_config")
    if (savedConfig) {
      setFieldConfig(JSON.parse(savedConfig))
    }
  }, [isAuthenticated, router, user])

  // Nova função para lidar com seleção de arquivo
  const handleFileSelect = (file: File | null) => {
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!allowedTypes.includes(file.type)) {
        setFileError("Apenas arquivos PDF, JPG e PNG são permitidos")
        setSelectedFile(null)
        return
      }

      if (file.size > maxSize) {
        setFileError("O arquivo deve ter no máximo 10MB")
        setSelectedFile(null)
        return
      }

      setFileError("")
      setSelectedFile(file)
      setMessage("")
    } else {
      setSelectedFile(null)
      setFileError("")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setMessage("Por favor, selecione um arquivo")
      return
    }

    const requiredFields = fieldConfig.filter((field) => field.required && field.visible)
    for (const field of requiredFields) {
      if (field.name !== "file" && !formData[field.name as keyof typeof formData]) {
        setMessage(`Por favor, preencha o campo: ${field.label}`)
        return
      }
    }

    setIsLoading(true)

    try {
      // Converter arquivo para base64
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(selectedFile)
      })

      const newDocument: Document = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileData,
        nomeFonte: formData.nomeFonte,
        descricao: formData.descricao,
        pagoPor: formData.pagoPor,
        dataPagamento: formData.dataPagamento,
        valorPago: formData.valorPago, // incluído valor pago no documento
        createdAt: new Date().toISOString(),
        userId: user?.email || "",
      }

      saveDocument(newDocument)

      // Limpar formulário
      setFormData({
        nomeFonte: "",
        descricao: "",
        pagoPor: "",
        dataPagamento: "",
        valorPago: "", // limpar campo valor pago
      })
      setSelectedFile(null)
      setFileError("")

      setMessage("Documento cadastrado com sucesso!")
    } catch (error) {
      setMessage("Erro ao processar o arquivo")
    }

    setIsLoading(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleExportPDF = () => {
    if (documents.length === 0) {
      alert("Não há documentos para exportar")
      return
    }
    exportToPDF(documents)
  }

  const handleExportExcel = () => {
    if (documents.length === 0) {
      alert("Não há documentos para exportar")
      return
    }
    exportToExcel(documents)
  }

  const isFieldVisible = (fieldName: string) => {
    if (fieldConfig.length === 0) return true
    const field = fieldConfig.find((f) => f.name === fieldName)
    return field ? field.visible : true
  }

  const isFieldRequired = (fieldName: string) => {
    if (fieldConfig.length === 0) return fieldName !== "descricao"
    const field = fieldConfig.find((f) => f.name === fieldName)
    return field ? field.required : false
  }

  const stats = {
    total: documents.length,
    thisMonth: documents.filter((doc) => {
      const docDate = new Date(doc.createdAt)
      const now = new Date()
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear()
    }).length,
    pdfCount: documents.filter((doc) => doc.fileType === "application/pdf").length,
    imageCount: documents.filter((doc) => doc.fileType.startsWith("image/")).length,
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Base para Cadastramento de Notas</h1>
              <p className="text-sm text-gray-600">Bem-vindo, {user?.name || user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === "admin" && (
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <BarChart3 className="h-4 w-4" />
                  Painel Admin
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/reports")}
                className="flex items-center gap-2 bg-transparent"
              >
                <BarChart3 className="h-4 w-4" />
                Relatório
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-600">Meus Documentos</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                  <p className="text-sm text-gray-600">Este Mês</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600 ml-auto" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-2xl font-bold">{stats.pdfCount}</p>
                  <p className="text-sm text-gray-600">PDFs</p>
                </div>
                <div className="ml-auto text-2xl">📄</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-2xl font-bold">{stats.imageCount}</p>
                  <p className="text-sm text-gray-600">Imagens</p>
                </div>
                <div className="ml-auto text-2xl">🖼️</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Cadastrar Documento
              </CardTitle>
              <CardDescription>Anexe documentos em PDF, JPG ou PNG e preencha as informações</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Substituindo input file simples pelo componente FileUpload */}
                {isFieldVisible("file") && (
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    required={isFieldRequired("file")}
                    error={fileError}
                  />
                )}

                {isFieldVisible("nomeFonte") && (
                  <div className="space-y-2">
                    <Label htmlFor="nomeFonte">Nome Fonte {isFieldRequired("nomeFonte") && "*"}</Label>
                    <Input
                      id="nomeFonte"
                      name="nomeFonte"
                      value={formData.nomeFonte}
                      onChange={handleInputChange}
                      placeholder="Digite o nome da fonte"
                      required={isFieldRequired("nomeFonte")}
                    />
                  </div>
                )}

                {isFieldVisible("descricao") && (
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição {isFieldRequired("descricao") && "*"}</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      placeholder="Descreva o documento (opcional)"
                      rows={3}
                      required={isFieldRequired("descricao")}
                    />
                  </div>
                )}

                {isFieldVisible("pagoPor") && (
                  <div className="space-y-2">
                    <Label htmlFor="pagoPor">Pago Por {isFieldRequired("pagoPor") && "*"}</Label>
                    <Input
                      id="pagoPor"
                      name="pagoPor"
                      value={formData.pagoPor}
                      onChange={handleInputChange}
                      placeholder="Nome da empresa que efetuou o pagamento"
                      required={isFieldRequired("pagoPor")}
                    />
                  </div>
                )}

                {isFieldVisible("valorPago") && (
                  <div className="space-y-2">
                    <Label htmlFor="valorPago">Valor Pago {isFieldRequired("valorPago") && "*"}</Label>
                    <Input
                      id="valorPago"
                      name="valorPago"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valorPago}
                      onChange={handleInputChange}
                      placeholder="0,00"
                      required={isFieldRequired("valorPago")}
                    />
                  </div>
                )}

                {isFieldVisible("dataPagamento") && (
                  <div className="space-y-2">
                    <Label htmlFor="dataPagamento">Data do Pagamento {isFieldRequired("dataPagamento") && "*"}</Label>
                    <Input
                      id="dataPagamento"
                      name="dataPagamento"
                      type="date"
                      value={formData.dataPagamento}
                      onChange={handleInputChange}
                      required={isFieldRequired("dataPagamento")}
                    />
                  </div>
                )}

                {message && (
                  <Alert variant={message.includes("sucesso") ? "default" : "destructive"}>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processando..." : "Concluir Cadastro"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resumo e Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos Recentes
                </div>
                {documents.length > 0 && (
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
                )}
              </CardTitle>
              <CardDescription>Últimos documentos cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum documento cadastrado ainda</p>
              ) : (
                <>
                  <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                    {documents
                      .slice(-3)
                      .reverse()
                      .map((doc) => (
                        <div key={doc.id} className="border rounded-lg p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{doc.fileName}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <p>
                              <strong>Fonte:</strong> {doc.nomeFonte}
                            </p>
                            <p>
                              <strong>Pago por:</strong> {doc.pagoPor}
                            </p>
                            <p>
                              <strong>Valor Pago:</strong> {doc.valorPago}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => router.push("/dashboard/documents")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Todos os Documentos ({documents.length})
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
