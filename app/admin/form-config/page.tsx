"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Settings, Save } from "lucide-react"

interface FormFieldConfig {
  id: string
  name: string
  label: string
  type: string
  visible: boolean
  required: boolean
  description: string
}

const DEFAULT_FIELDS: FormFieldConfig[] = [
  {
    id: "file",
    name: "file",
    label: "Anexar Documento",
    type: "file",
    visible: true,
    required: true,
    description: "Campo para upload de arquivos PDF, JPG ou PNG",
  },
  {
    id: "nomeFonte",
    name: "nomeFonte",
    label: "Nome Fonte",
    type: "text",
    visible: true,
    required: true,
    description: "Nome da fonte do documento",
  },
  {
    id: "descricao",
    name: "descricao",
    label: "Descrição",
    type: "textarea",
    visible: true,
    required: false,
    description: "Descrição opcional do documento",
  },
  {
    id: "pagoPor",
    name: "pagoPor",
    label: "Pago Por",
    type: "text",
    visible: true,
    required: true,
    description: "Nome da empresa que efetuou o pagamento",
  },
  {
    id: "dataPagamento",
    name: "dataPagamento",
    label: "Data do Pagamento",
    type: "date",
    visible: true,
    required: true,
    description: "Data em que o pagamento foi realizado",
  },
]

export default function FormConfigPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [fields, setFields] = useState<FormFieldConfig[]>(DEFAULT_FIELDS)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/login")
      return
    }
    loadFormConfig()
  }, [isAuthenticated, isAdmin, router])

  const loadFormConfig = () => {
    const savedConfig = localStorage.getItem("form_field_config")
    if (savedConfig) {
      setFields(JSON.parse(savedConfig))
    }
  }

  const handleFieldToggle = (fieldId: string, property: "visible" | "required", value: boolean) => {
    setFields((prevFields) =>
      prevFields.map((field) => {
        if (field.id === fieldId) {
          // Se o campo está sendo marcado como não visível, também deve ser não obrigatório
          if (property === "visible" && !value) {
            return { ...field, visible: false, required: false }
          }
          // Se o campo está sendo marcado como obrigatório, deve ser visível
          if (property === "required" && value) {
            return { ...field, visible: true, required: true }
          }
          return { ...field, [property]: value }
        }
        return field
      }),
    )
  }

  const handleSave = () => {
    localStorage.setItem("form_field_config", JSON.stringify(fields))
    setSuccess("Configurações salvas com sucesso!")
    setTimeout(() => setSuccess(""), 3000)
  }

  const resetToDefault = () => {
    setFields(DEFAULT_FIELDS)
    localStorage.removeItem("form_field_config")
    setSuccess("Configurações restauradas para o padrão!")
    setTimeout(() => setSuccess(""), 3000)
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
            <h1 className="text-xl font-semibold text-gray-900">Configuração de Formulários</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campos do Formulário</h2>
            <p className="text-gray-600">Configure quais campos são visíveis e obrigatórios para os usuários</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetToDefault}>
              Restaurar Padrão
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Configurações
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <Card key={field.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{field.label}</CardTitle>
                    <CardDescription>{field.description}</CardDescription>
                  </div>
                  <Settings className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor={`visible-${field.id}`} className="text-sm font-medium">
                        Campo Visível
                      </Label>
                      <p className="text-xs text-gray-500">
                        {field.visible ? "Campo aparece no formulário" : "Campo oculto do formulário"}
                      </p>
                    </div>
                    <Switch
                      id={`visible-${field.id}`}
                      checked={field.visible}
                      onCheckedChange={(checked) => handleFieldToggle(field.id, "visible", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor={`required-${field.id}`} className="text-sm font-medium">
                        Campo Obrigatório
                      </Label>
                      <p className="text-xs text-gray-500">
                        {field.required ? "Preenchimento obrigatório" : "Preenchimento opcional"}
                      </p>
                    </div>
                    <Switch
                      id={`required-${field.id}`}
                      checked={field.required}
                      onCheckedChange={(checked) => handleFieldToggle(field.id, "required", checked)}
                      disabled={!field.visible}
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Tipo:</span>
                    <span className="capitalize">{field.type}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium">Nome do campo:</span>
                    <code className="bg-gray-200 px-1 rounded text-xs">{field.name}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resumo da Configuração</CardTitle>
            <CardDescription>Visualize como o formulário ficará para os usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Campos Visíveis ({fields.filter((f) => f.visible).length})</h4>
                <ul className="space-y-1">
                  {fields
                    .filter((f) => f.visible)
                    .map((field) => (
                      <li key={field.id} className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {field.label}
                        {field.required && <span className="text-red-500 text-xs">*</span>}
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Campos Obrigatórios ({fields.filter((f) => f.required).length})
                </h4>
                <ul className="space-y-1">
                  {fields
                    .filter((f) => f.required)
                    .map((field) => (
                      <li key={field.id} className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {field.label}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
