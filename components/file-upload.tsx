"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, ImageIcon, X, CheckCircle } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  required?: boolean
  error?: string
}

export default function FileUpload({ onFileSelect, selectedFile, required = false, error }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelection(file)
    }
  }

  const handleFileSelection = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      onFileSelect(null)
      return
    }

    if (file.size > maxSize) {
      onFileSelect(null)
      return
    }

    onFileSelect(file)
  }

  const removeFile = () => {
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    }
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Anexar Documento {required && <span className="text-red-500">*</span>}</Label>

      {!selectedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
            ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-3">
            <div
              className={`
              p-3 rounded-full transition-colors duration-200
              ${isDragOver ? "bg-blue-100" : "bg-gray-100"}
            `}
            >
              <Upload className={`h-6 w-6 ${isDragOver ? "text-blue-600" : "text-gray-600"}`} />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {isDragOver ? "Solte o arquivo aqui" : "Clique para selecionar ou arraste um arquivo"}
              </p>
              <p className="text-xs text-gray-500">PDF, JPG ou PNG até 10MB</p>
            </div>

            <Button type="button" variant="outline" size="sm" className="mt-2 bg-transparent">
              Escolher Arquivo
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">{getFileIcon(selectedFile.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type.split("/")[1].toUpperCase()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Tipos aceitos: PDF, JPG, PNG</p>
        <p>• Tamanho máximo: 10MB</p>
        <p>• Você pode arrastar e soltar o arquivo na área acima</p>
      </div>
    </div>
  )
}
