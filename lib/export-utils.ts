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
}

export function exportToPDF(documents: Document[]): void {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Documentos</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          color: #2563eb;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0 0 0;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
        @media print {
          table {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Documentos</h1>
        <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        <p>Total de documentos: ${documents.length}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Fornecedor</th>
            <th>Data do pagamento</th>
            <th>Valor</th>
            <th>Pago por</th>
          </tr>
        </thead>
        <tbody>
          ${documents
            .map(
              (doc) => `
            <tr>
              <td>${escapeHTML(doc.nomeFonte)}</td>
              <td>${new Date(doc.dataPagamento).toLocaleDateString("pt-BR")}</td>
              <td>R$ ${Number.parseFloat(doc.valorPago || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${escapeHTML(doc.pagoPor)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Base para Cadastramento de Notas - Sistema de Gerenciamento de Documentos</p>
      </div>
    </body>
    </html>
  `

  // Criar um iframe oculto para imprimir
  const iframe = document.createElement("iframe")
  iframe.style.display = "none"
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (iframeDoc) {
    iframeDoc.open()
    iframeDoc.write(htmlContent)
    iframeDoc.close()

    // Aguardar o carregamento e então imprimir
    setTimeout(() => {
      iframe.contentWindow?.print()
      // Remover iframe após um tempo
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)
    }, 500)
  }
}

export function exportToExcel(documents: Document[]): void {
  const headers = ["Fornecedor", "Data do pagamento", "Valor", "Pago por"]

  let csvContent = "\uFEFF" + headers.join(";") + "\n"

  documents.forEach((doc) => {
    const row = [
      escapeCSVBrazil(doc.nomeFonte),
      escapeCSVBrazil(new Date(doc.dataPagamento).toLocaleDateString("pt-BR")),
      escapeCSVBrazil(
        `R$ ${Number.parseFloat(doc.valorPago || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ),
      escapeCSVBrazil(doc.pagoPor),
    ]
    csvContent += row.join(";") + "\n"
  })

  downloadFile(csvContent, "documentos.csv", "text/csv;charset=utf-8")
}

function escapeHTML(str: string): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function escapeCSVBrazil(str: string): string {
  if (!str) return '""'
  // Se contém ponto e vírgula, aspas ou quebra de linha, envolver em aspas
  if (str.includes(";") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
