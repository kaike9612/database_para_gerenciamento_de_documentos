# 📋 Base para Cadastramento de Notas

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

### Administradores e Comum

Email: admin@exemplo.com
Senha: 123456

Email: user@exemplo.com
Senha: 123456

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Autenticação**: Context API personalizado
- **Armazenamento**: LocalStorage (temporário)
- **Exportação**: jsPDF, xlsx
- **Ícones**: Lucide React

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
\`\`\`bash
git clone https://github.com/seu-usuario/base-cadastramento-notas.git
cd base-cadastramento-notas
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. **Execute o projeto**
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

## 🌐 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente (se necessário)
3. Deploy automático a cada push

### Outras opções
- **Netlify**: Deploy via GitHub
- **Railway**: Suporte a banco de dados
- **GitHub Pages**: Para versão estática

## 📁 Estrutura do Projeto

```
├── app/
│   ├── admin/              # Páginas administrativas
│   ├── dashboard/          # Dashboard principal
│   ├── login/             # Página de login
│   └── layout.tsx         # Layout principal
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   └── ...                # Componentes customizados
├── contexts/
│   └── auth-context.tsx   # Contexto de autenticação
├── lib/
│   ├── export-utils.ts    # Utilitários de exportação
│   └── utils.ts           # Utilitários gerais
└── types/
    └── document.ts        # Tipos TypeScript
```

## 🔄 Roadmap de Melhorias

### Próximas Versões
- [ ] Integração com banco de dados (Supabase/Neon)
- [ ] Sistema de backup automático
- [ ] Notificações em tempo real
- [ ] API REST para integrações
- [ ] App mobile (React Native)
- [ ] Dashboard com gráficos avançados

### Integrações Planejadas
- [ ] **Supabase**: Banco de dados PostgreSQL + Auth
- [ ] **Vercel Blob**: Armazenamento de arquivos
- [ ] **Resend**: Sistema de emails
- [ ] **Stripe**: Pagamentos (versão premium)

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

*Sistema de gerenciamento de documentos empresariais - Versão 1.0*
\`\`\`
