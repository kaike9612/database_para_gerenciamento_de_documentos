# 📋 Sistema de Gerenciamento de Documentos

Sistema completo de gerenciamento de documentos desenvolvido em Next.js para controle e organização de notas fiscais, recibos e documentos empresariais.

## 🚀 Funcionalidades Principais

### 👤 **Sistema de Autenticação**
- Login seguro com validação de credenciais
- Controle de acesso por níveis (Usuário/Administrador)
- Interface responsiva e intuitiva

### 📄 **Gerenciamento de Documentos**
- Upload de arquivos (PDF, JPG, PNG)
- Cadastro com informações detalhadas:
  - Fornecedor
  - Data de pagamento
  - Valor pago
  - Empresa pagadora
- Visualização em lista organizada
- Sistema de filtros avançados

### 📊 **Relatórios e Exportação**
- Geração de relatórios em PDF
- Exportação para Excel
- Filtros por período, fornecedor e empresa
- Visualização de totais e estatísticas

### 🔧 **Painel Administrativo**
- Gerenciamento completo de usuários
- Configuração de campos do formulário
- Relatórios consolidados de todos os usuários
- Controle de permissões

## 👥 Usuários de Teste

### Administradores
\`\`\`
Email: admin@exemplo.com
Senha: 123456

Email: ti@exemplo.com
Senha: 123456
\`\`\`

### Usuários Comuns
\`\`\`
Email: usuario@exemplo.com
Senha: 123456

Email: user@exemplo.com
Senha: 123456
\`\`\`

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Componentes UI**: Radix UI + shadcn/ui
- **Gerenciamento de Estado**: React Context API
- **Formulários**: React Hook Form + Zod
- **Exportação**: jsPDF, xlsx
- **Ícones**: Lucide React
- **Fontes**: Geist Sans & Geist Mono

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18 ou superior
- npm, yarn ou pnpm

### Passos para instalação

1. **Clone o repositório**
\`\`\`bash
git clone https://github.com/kaike9612/database_base_para_cadastramento_de_notas.git
cd database_base_para_cadastramento_de_notas
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
# ou
yarn install
# ou
pnpm install
\`\`\`

3. **Execute o projeto em desenvolvimento**
\`\`\`bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
\`\`\`

4. **Acesse no navegador**
\`\`\`
http://localhost:3000
\`\`\`

## 🏗️ Build para Produção

\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
├── app/
│   ├── admin/              # Páginas administrativas
│   │   ├── form-config/   # Configuração de formulários
│   │   ├── reports/       # Relatórios administrativos
│   │   └── users/         # Gerenciamento de usuários
│   ├── dashboard/          # Dashboard principal
│   │   ├── documents/     # Listagem de documentos
│   │   └── reports/       # Relatórios do usuário
│   ├── login/             # Página de login
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── file-upload.tsx    # Componente de upload
│   └── theme-provider.tsx # Provider de tema
├── contexts/
│   └── auth-context.tsx   # Contexto de autenticação
├── lib/
│   ├── export-utils.ts    # Utilitários de exportação
│   └── utils.ts           # Utilitários gerais
└── hooks/
    ├── use-mobile.ts      # Hook para detecção mobile
    └── use-toast.ts       # Hook para notificações
\`\`\`

## 💾 Armazenamento de Dados

Atualmente, o sistema utiliza **localStorage** para armazenamento temporário dos dados. Para uso em produção, recomenda-se integrar com um banco de dados.

### Opções de Integração Recomendadas:

#### Banco de Dados
- **Supabase**: PostgreSQL + Autenticação + Storage
- **Neon**: PostgreSQL serverless
- **PlanetScale**: MySQL serverless

#### Armazenamento de Arquivos
- **Cloudinary**: CDN para imagens e documentos
- **AWS S3**: Armazenamento escalável
- **UploadThing**: Upload simplificado

## 🔄 Roadmap de Melhorias

### Próximas Versões
- [ ] Integração com banco de dados
- [ ] Armazenamento de arquivos em nuvem
- [ ] Sistema de backup automático
- [ ] Notificações em tempo real
- [ ] API REST para integrações
- [ ] Dashboard com gráficos avançados
- [ ] Busca avançada com filtros
- [ ] Histórico de alterações
- [ ] Auditoria de ações

### Funcionalidades Futuras
- [ ] App mobile (React Native)
- [ ] Integração com sistemas ERP
- [ ] OCR para extração de dados
- [ ] Assinatura digital de documentos
- [ ] Workflow de aprovação
- [ ] Multi-idioma (i18n)

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](https://github.com/kaike9612/database_base_para_cadastramento_de_notas/issues) descrevendo:
- Passos para reproduzir
- Comportamento esperado
- Comportamento atual
- Screenshots (se aplicável)

## 📞 Suporte

Para dúvidas e suporte:
- Abra uma [issue](https://github.com/kaike9612/database_base_para_cadastramento_de_notas/issues)
- Consulte a [documentação](https://github.com/kaike9612/database_base_para_cadastramento_de_notas/wiki)

---

**Desenvolvido com Next.js e TypeScript**

*Sistema de gerenciamento de documentos empresariais - Versão 1.0.0*
