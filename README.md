# 📅 Sistema de Agendamento Online

Um aplicativo completo de agendamento online desenvolvido com HTML, CSS e JavaScript, totalmente integrado ao Google Sheets via API Sheety. Focado em dispositivos móveis com notificações toast elegantes.

## 🚀 Características Principais

### ✨ Funcionalidades do Cliente
- **Formulário de Agendamento Intuitivo**: Interface limpa e responsiva
- **Validação Inteligente**: Verificação de disponibilidade em tempo real
- **Preenchimento Automático**: Dados do cliente são preenchidos automaticamente ao digitar o telefone
- **Visualização de Agendamentos**: Popup mostrando agendamentos futuros do cliente
- **Integração WhatsApp**: Envio automático de confirmação via WhatsApp
- **Notificações Toast**: Feedback visual elegante para todas as ações

### 🔧 Funcionalidades Administrativas
- **Dashboard Completo**: Visão geral com estatísticas e gráficos
- **Gerenciamento de Agendamentos**: CRUD completo com filtros
- **Controle de Horários**: Configuração dinâmica por dia da semana
- **Gestão de Serviços**: Cadastro com duração e valores
- **Controle de Profissionais**: Gestão de disponibilidade e férias
- **Relatórios Financeiros**: Análises detalhadas com filtros personalizados
- **Gráficos Interativos**: Visualizações com Chart.js
- **Sistema de Login**: Autenticação segura

### 📱 Design e UX
- **Mobile-First**: Otimizado para dispositivos móveis
- **Responsivo**: Adaptável a tablets e desktops
- **Notificações Toast**: Sistema elegante de feedback
- **Interface Moderna**: Design clean com gradientes e animações
- **Acessibilidade**: Suporte a navegação por teclado e leitores de tela

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Gráficos**: Chart.js
- **API**: Google Sheets via Sheety
- **Fontes**: Google Fonts (Inter)
- **Ícones**: Emojis nativos

## 📋 Pré-requisitos

1. **Google Sheets**: Planilha configurada com as abas necessárias
2. **Conta Sheety**: Para integração com Google Sheets
3. **Servidor Web**: Para servir os arquivos (pode ser local)

## 🔗 Configuração da API Sheety

### Estrutura da Planilha Google Sheets

A planilha deve ter o nome `agendabeta` e conter as seguintes abas:

#### 📊 Aba: `agendabeta` (Agendamentos)
```
Colunas: nome | data | hora | email | servico | valor | telefone | profissional
```

#### ⏰ Aba: `horabeta` (Horários Padrão)
```
Colunas: diasemana | hora | ativo
Exemplo:
segunda   | 09:00 | TRUE
segunda   | 10:00 | TRUE
terça     | 09:00 | TRUE
```

#### 💼 Aba: `servicobeta` (Serviços)
```
Colunas: servico | duracao | valor
Exemplo:
Corte de Cabelo | 60 | 50.00
Manicure       | 45 | 30.00
```

#### 👥 Aba: `profissional` (Profissionais)
```
Colunas: profissional | de | ate
Exemplo:
Ana   | 2024-01-01 | 2024-12-31
Carla | 2024-01-01 | 2024-12-31
```

#### 🔐 Aba: `login` (Credenciais)
```
Colunas: user | senha
Exemplo:
admin | 123456
```

### URLs da API Sheety

Substitua `{SEU_ID_SHEETY}` pelo seu ID real:

```
Base URL: https://api.sheety.co/{SEU_ID_SHEETY}/agendabeta/

Endpoints:
- Agendamentos: /agendabeta
- Horários: /horabeta  
- Serviços: /servicobeta
- Profissionais: /profissional
- Login: /login
```

## 🚀 Instalação e Configuração

### 1. Clone ou Baixe o Projeto
```bash
# Se usando Git
git clone [URL_DO_REPOSITORIO]
cd agendamento-app

# Ou extraia o arquivo ZIP
```

### 2. Configure a API
Edite o arquivo `js/api.js` e substitua a URL base:

```javascript
this.baseURL = 'https://api.sheety.co/SEU_ID_AQUI/agendabeta';
```

### 3. Configure o WhatsApp
No arquivo `js/main.js`, altere o número do WhatsApp:

```javascript
const CONFIG = {
    WHATSAPP_NUMBER: '77999757808', // Substitua pelo seu número
    // ...
};
```

### 4. Inicie um Servidor Local

#### Opção 1: Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Opção 2: Node.js
```bash
npx http-server -p 8000
```

#### Opção 3: PHP
```bash
php -S localhost:8000
```

### 5. Acesse o Sistema
- **Página Principal**: http://localhost:8000
- **Área Administrativa**: http://localhost:8000/admin

## 📖 Como Usar

### Para Clientes

1. **Acesse a página principal**
2. **Preencha o telefone**: O sistema verificará se você já é cliente
3. **Selecione profissional e serviço**: O valor será preenchido automaticamente
4. **Escolha data e horário**: Apenas horários disponíveis serão mostrados
5. **Confirme o agendamento**: Revise os dados no popup
6. **Envie pelo WhatsApp**: Opcional para confirmação

### Para Administradores

1. **Acesse a área administrativa**: Clique no ⚙️ no canto superior direito
2. **Faça login**: Use as credenciais configuradas na planilha
3. **Navegue pelas seções**:
   - **Visão Geral**: Dashboard com estatísticas
   - **Agendamentos**: Gerenciar todos os agendamentos
   - **Horários**: Configurar horários de funcionamento
   - **Serviços**: Cadastrar serviços e preços
   - **Profissionais**: Gerenciar equipe e disponibilidade
   - **Relatórios**: Análises financeiras
   - **Configurações**: Alterar senha

## 🎨 Personalização

### Cores e Tema
Edite o arquivo `css/style.css` para personalizar:

```css
/* Cores principais */
:root {
    --primary-color: #3b82f6;
    --secondary-color: #10b981;
    --error-color: #ef4444;
    --warning-color: #f59e0b;
}
```

### Imagem do Cabeçalho
Substitua o gradiente por uma imagem no CSS:

```css
.header-image {
    background-image: url('images/sua-imagem.jpg');
    background-size: cover;
}
```

### Textos e Labels
Edite os arquivos HTML para alterar textos e labels conforme necessário.

## 📱 Recursos Mobile

- **Design Responsivo**: Adaptação automática para diferentes tamanhos de tela
- **Touch Friendly**: Botões e campos otimizados para toque
- **Notificações Toast**: Posicionamento inteligente em dispositivos móveis
- **Navegação Simplificada**: Interface intuitiva para usuários móveis

## 🔒 Segurança

- **Validação Client-Side**: Verificações em tempo real
- **Sanitização de Dados**: Prevenção contra XSS
- **Autenticação**: Sistema de login para área administrativa
- **Validação de Disponibilidade**: Prevenção de agendamentos duplicados

## 🐛 Solução de Problemas

### Erro de CORS
Se encontrar erros de CORS, certifique-se de:
1. Estar servindo os arquivos via HTTP (não file://)
2. A API Sheety estar configurada corretamente
3. As URLs da API estarem corretas

### Dados Não Carregam
Verifique:
1. Conexão com internet
2. URLs da API no arquivo `js/api.js`
3. Estrutura das abas na planilha Google Sheets
4. Console do navegador para erros específicos

### Layout Quebrado
1. Verifique se todos os arquivos CSS estão sendo carregados
2. Teste em diferentes navegadores
3. Verifique o console para erros de JavaScript

## 📊 Estrutura de Arquivos

```
agendamento-app/
├── index.html              # Página principal
├── css/
│   └── style.css           # Estilos principais
├── js/
│   ├── api.js              # Integração com Sheety
│   ├── utils.js            # Funções utilitárias
│   ├── toast.js            # Sistema de notificações
│   ├── agendamento.js      # Lógica de agendamento
│   └── main.js             # Arquivo principal
├── admin/
│   ├── index.html          # Página administrativa
│   ├── admin.css           # Estilos da área admin
│   └── admin.js            # Lógica administrativa
└── images/                 # Imagens (opcional)
```

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no repositório
- Entre em contato via WhatsApp: (77) 99975-7808

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Notificações push
- [ ] Integração com calendário
- [ ] Sistema de avaliações
- [ ] Múltiplas unidades
- [ ] App mobile nativo
- [ ] Integração com pagamentos

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de agendamentos**

