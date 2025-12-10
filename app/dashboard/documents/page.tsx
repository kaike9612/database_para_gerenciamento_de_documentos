"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getFileFromIndexedDB } from "path-to-your-file-utils" // Replace with actual import path
import { FileImage } from "path-to-your-icons" // Replace with actual import path
import { Calendar } from "path-to-your-icons" // Replace with actual import path

interface ImagePreviewProps {
  fileId: string
  fileName: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ fileId, fileName }) => {
  const [imageSrc, setImageSrc] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      const fileData = await getFileFromIndexedDB(fileId)
      setImageSrc(fileData)
      setLoading(false)
    }
    loadImage()
  }, [fileId])

  if (loading) {
    return <div className="text-center py-8">Carregando imagem...</div>
  }

  if (!imageSrc) {
    return (
      <div className="text-center py-8">
        <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Erro ao carregar imagem</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-400" />
      <span className="font-medium">Data:</span>
      <span>{fileName}</span>
    </div>
  )
}

export default ImagePreview
