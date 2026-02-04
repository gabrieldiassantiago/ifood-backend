# 🍔 iFood Clone - Backend

Backend completo para um clone do iFood, desenvolvido com **Elysia.js**, **Bun**, **Prisma ORM** e **PostgreSQL**. Inclui sistema de autenticação JWT, gestão de pedidos, integração com Mercado Pago para pagamentos PIX e WebSocket para atualizações em tempo real.

---

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Modelo de Dados](#-modelo-de-dados)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [API Endpoints](#-api-endpoints)
- [Módulos](#-módulos)
- [WebSocket](#-websocket)
- [Pagamentos](#-pagamentos)
- [Autenticação](#-autenticação)
- [Tratamento de Erros](#-tratamento-de-erros)
- [Documentação da API](#-documentação-da-api)

---

## 🚀 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| [Elysia.js](https://elysiajs.com/) | ^1.4.22 | Framework web rápido e type-safe para Bun |
| [Bun](https://bun.sh/) | Latest | Runtime JavaScript all-in-one |
| [Prisma](https://www.prisma.io/) | ^7.2.0 | ORM moderno para TypeScript |
| [PostgreSQL](https://www.postgresql.org/) | 14+ | Banco de dados relacional |
| [Mercado Pago](https://www.mercadopago.com.br/) | ^2.11.0 | Gateway de pagamentos |
| [Zod](https://zod.dev/) | ^4.3.5 | Validação de schemas TypeScript-first |
| [JWT](https://jwt.io/) | ^1.4.0 | Autenticação baseada em tokens |

### Plugins Elysia Utilizados

- `@elysiajs/cors` - Configuração de CORS
- `@elysiajs/jwt` - Autenticação JWT
- `@elysiajs/openapi` - Documentação OpenAPI/Swagger
- `@elysiajs/static` - Servir arquivos estáticos
- `@elysiajs/swagger` - Interface Swagger UI

---

## 🏗️ Arquitetura

```
ifood-backend/
├── src/
│   ├── index.ts                    # Entry point da aplicação
│   ├── config/
│   │   └── mercadopago.config.ts   # Configuração do Mercado Pago
│   ├── middlewares/
│   │   └── error.middleware.ts     # Handler global de erros
│   ├── errors/
│   │   ├── custom-errors.ts        # Classes de erro customizadas
│   │   └── index.ts                # Exportações
│   └── modules/                    # Módulos da aplicação
│       ├── auth/                   # Autenticação
│       ├── users/                  # Usuários
│       ├── products/               # Produtos
│       ├── categories/             # Categorias
│       ├── orders/                 # Pedidos
│       ├── payments/               # Pagamentos
│       ├── addresses/              # Endereços
│       ├── delivery/               # Taxas de entrega
│       ├── store/                  # Configurações da loja
│       └── websocket/              # WebSocket
├── prisma/
│   ├── schema.prisma               # Schema do banco de dados
│   ├── db.ts                       # Cliente Prisma
│   ├── seed.ts                     # Dados iniciais
│   └── migrations/                 # Migrações
├── generated/prisma/               # Cliente Prisma gerado
├── public/                         # Arquivos estáticos
├── .env                            # Variáveis de ambiente
├── package.json
└── README.md
```

### Padrão por Módulo

Cada módulo segue uma estrutura consistente:

```
modules/[nome]/
├── [nome].controller.ts    # Rotas HTTP
├── [nome].service.ts       # Lógica de negócio
├── [nome].repository.ts    # Acesso ao banco
├── [nome].schemas.ts       # Validações Zod (quando necessário)
├── [nome].types.ts         # Tipos TypeScript
├── [nome].model.ts         # Modelos auxiliares
└── errors/
    └── [nome].errors.ts    # Erros específicos
```

---

## 🗄️ Modelo de Dados

### Entidades Principais

```prisma
┌─────────────────────────────────────────────────────────────┐
│                         User                                │
├─────────────────────────────────────────────────────────────┤
│ id, name, phone, email, password, role(USER|ADMIN), points  │
├─────────────────────────────────────────────────────────────┤
│ Relations: Address[], Order[], Message[], RefreshToken[]   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Address     │    │    Order      │    │    Store      │
├───────────────┤    ├───────────────┤    ├───────────────┤
│ street, num,  │    │ status, total,│    │ name, phone,  │
│ district, city│    │ deliveryFee,  │    │ isOpen,       │
│ reference     │    │ paymentMethod │    │ estimatedTime │
└───────────────┘    └───────┬───────┘    └───────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Payment     │    │  OrderItem    │    │    Message    │
├───────────────┤    ├───────────────┤    ├───────────────┤
│ qrCode,       │    │ quantity,     │    │ content,      │
│ amount,       │    │ price,        │    │ sender        │
│ status,       │    │ observation   │    │               │
│ paymentMethod │    │               │    │               │
└───────────────┘    └───────┬───────┘    └───────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌───────────────┐  ┌───────────────┐
            │    Product    │  │OrderItemAddon │
            ├───────────────┤  ├───────────────┤
            │ name, price,  │  │ name, price   │
            │ description,  │  │               │
            │ imageUrl      │  │               │
            └───────┬───────┘  └───────────────┘
                    │
                    ▼
            ┌───────────────┐
            │   Category    │
            ├───────────────┤
            │ name, order,  │
            │ isActive      │
            └───────────────┘
```

### Enums

| Enum | Valores |
|------|---------|
| `Role` | USER, ADMIN |
| `OrderStatus` | PENDING, PENDING_PAYMENT, CREATED, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, PENDING_CANCELLATION |
| `PaymentMethod` | CASH, CREDIT_CARD, DEBIT_CARD, PIX |
| `PaymentStatus` | PENDING, APPROVED, REJECTED, CANCELLED, REFUNDED |
| `DeliveryType` | DELIVERY, PICKUP |

---

## 📦 Instalação

### Pré-requisitos

- [Bun](https://bun.sh/) instalado
- PostgreSQL 14+ rodando
- Conta no [Mercado Pago](https://www.mercadopago.com.br/) (para pagamentos)

### Passos

```bash
# Clone o repositório
git clone <repo-url>
cd ifood-backend

# Instale as dependências
bun install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banconpx prisma migrate dev

# (Opcional) Popule o banco com dados iniciais
bun run seed

# Inicie o servidor em modo desenvolvimento
bun run dev
```

O servidor estará disponível em: `http://localhost:3001`

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5433/nome_banco?connection_limit=30&pool_timeout=30"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN_AQUI

# Appwrite (para armazenamento de arquivos)
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=seu_project_id
APPWRITE_API_KEY=sua_api_key
APPWRITE_BUCKET_ID=seu_bucket_id
```

### Obtendo o Access Token do Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Copie o **Access Token** de teste ou produção

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `bun run dev` | Inicia o servidor em modo watch |
| `bun run seed` | Popula o banco com dados iniciais |
| `bun run db:reset` | Reseta o banco e executa o seed |
| `bun run db:studio` | Abre o Prisma Studio (GUI do banco) |
| `bun test` | Executa os testes (não implementado) |

---

## 🔌 API Endpoints

### Autenticação (`/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registra novo usuário |
| POST | `/auth/login` | Login com phone/password |
| POST | `/auth/refresh` | Renova tokens JWT |
| POST | `/auth/logout` | Logout (invalida refresh token) |
| GET | `/auth/me` | Dados do usuário logado |
| POST | `/auth/change-password` | Altera senha |

### Usuários (`/users`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/users` | Lista todos os usuários (admin) |
| GET | `/users/:id` | Busca usuário por ID |
| PATCH | `/users/:id` | Atualiza usuário |
| DELETE | `/users/:id` | Remove usuário |
| POST | `/users/:id/points` | Adiciona pontos |

### Produtos (`/products`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/products` | Lista produtos disponíveis |
| GET | `/products/:id` | Busca produto por ID |
| POST | `/products` | Cria novo produto (admin) |
| PUT | `/products/:id` | Atualiza produto (admin) |
| DELETE | `/products/:id` | Remove produto (admin) |

### Categorias (`/categories`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/categories` | Lista categorias |
| GET | `/categories/:id` | Busca categoria |
| POST | `/categories` | Cria categoria (admin) |
| PUT | `/categories/:id` | Atualiza categoria (admin) |
| DELETE | `/categories/:id` | Remove categoria (admin) |

### Pedidos (`/orders`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/orders` | Lista pedidos do usuário |
| GET | `/orders/:id` | Busca pedido por ID |
| POST | `/orders` | Cria novo pedido |
| PATCH | `/orders/:id/status` | Atualiza status (admin) |
| POST | `/orders/:id/cancel` | Solicita cancelamento |

### Pagamentos (`/payments`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/payments` | Cria pagamento PIX |
| GET | `/payments/:id` | Consulta status do pagamento |
| POST | `/payments/webhook` | Webhook Mercado Pago |

### Endereços (`/addresses`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/addresses` | Lista endereços do usuário |
| POST | `/addresses` | Adiciona endereço |
| PUT | `/addresses/:id` | Atualiza endereço |
| DELETE | `/addresses/:id` | Remove endereço |

### Taxas de Entrega (`/delivery`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/delivery/fees` | Lista taxas de entrega |
| GET | `/delivery/fees/:district` | Busca taxa por bairro |
| POST | `/delivery/fees` | Cria taxa (admin) |
| PUT | `/delivery/fees/:id` | Atualiza taxa (admin) |

### Loja (`/store`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/store` | Configurações da loja |
| PUT | `/store` | Atualiza configurações (admin) |
| GET | `/store/status` | Status de abertura |

---

## 📦 Módulos

### 🔐 Autenticação

Sistema completo de autenticação com JWT e refresh tokens.

**Features:**
- Registro e login com phone/password
- Tokens JWT com expiração curta (15 min)
- Refresh tokens com expiração longa (7 dias)
- Logout em todos os dispositivos
- Proteção de rotas

**Middleware de Autenticação:**
```typescript
// Verifica JWT em rotas protegidas
app.use(authMiddleware)
```

### 👤 Usuários

Gestão de usuários com suporte a dois papéis: **USER** e **ADMIN**.

**Features:**
- CRUD completo
- Sistema de pontos/fidelidade
- Histórico de pedidos
- Múltiplos endereços

### 🍔 Produtos & Categorias

Sistema de cardápio completo.

**Features:**
- Produtos com imagens (via Appwrite)
- Categorias ordenadas
- Adicionais (addons) por produto
- Disponibilidade dinâmica

### 📦 Pedidos

Fluxo completo de pedidos com múltiplos status.

**Fluxo de Status:**
```
CREATED → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
   ↓
PENDING_PAYMENT (para PIX)
   ↓
PENDING_CANCELLATION → CANCELLED
```

### 💳 Pagamentos

Integração completa com Mercado Pago para pagamentos via PIX.

**Features:**
- Geração de QR Code PIX
- Webhook para confirmação automática
- Múltiplas formas de pagamento
- Sistema de reembolso

---

## 🔌 WebSocket

Endpoint WebSocket para atualizações em tempo real.

### Conexão

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
```

### Eventos

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `order:created` | Server → Client | Novo pedido criado |
| `order:updated` | Server → Client | Status do pedido atualizado |
| `payment:confirmed` | Server → Client | Pagamento confirmado |

### Exemplo de Uso

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'order:updated':
      console.log(`Pedido #${data.orderId}: ${data.status}`);
      break;
    case 'payment:confirmed':
      console.log('Pagamento confirmado!');
      break;
  }
};
```

---

## 💰 Pagamentos

### PIX via Mercado Pago

1. **Criar Pagamento:**
```http
POST /payments
{
  "orderId": "uuid",
  "amount": 59.90
}
```

2. **Resposta:**
```json
{
  "id": "payment-uuid",
  "qrCode": "00020126580014BR.GOV...",
  "qrCodeBase64": "data:image/png;base64,...",
  "ticketUrl": "https://mercadopago.com/...",
  "status": "PENDING"
}
```

3. **Confirmação:** O Mercado Pago envia webhook para `/payments/webhook` quando o pagamento é confirmado.

### Webhook

Configure no dashboard do Mercado Pago:
```
URL: https://sua-api.com/payments/webhook
```

---

## 🔒 Autenticação

### Fluxo de Login

```
┌─────────┐                    ┌─────────┐
│ Cliente │ ──POST /login────► │ Servidor│
└─────────┘    {phone, pass}   └────┬────┘
                                    │
                                    ▼
                              ┌─────────────┐
                              │  Verifica   │
                              │  credenciais│
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │ Gera tokens │
                              │ Access +    │
                              │ Refresh     │
                              └──────┬──────┘
                                     │
◄────────────────────────────────────┘
    {accessToken, refreshToken}
```

### Renovação de Token

```http
POST /auth/refresh
{
  "refreshToken": "token-aqui"
}
```

---

## ⚠️ Tratamento de Erros

O sistema utiliza uma hierarquia de erros customizados:

### Classes de Erro

| Classe | Status Code | Uso |
|--------|-------------|-----|
| `AppError` | Base | Classe base para todos os erros |
| `NotFoundError` | 404 | Recurso não encontrado |
| `ValidationError` | 400 | Dados inválidos |
| `UnauthorizedError` | 401 | Não autenticado |
| `ForbiddenError` | 403 | Sem permissão |
| `ConflictError` | 409 | Conflito (ex: usuário já existe) |

### Resposta de Erro

```json
{
  "error": "ValidationError",
  "message": "Telefone já cadastrado",
  "code": "USER_EXISTS",
  "statusCode": 400
}
```

---

## 📚 Documentação da API

A documentação completa da API está disponível em:

- **Scalar UI:** `http://localhost:3001/docs`
- **OpenAPI JSON:** `http://localhost:3001/docs/json`

### Autenticação na Documentação

A documentação suporta autenticação via Bearer Token. Clique em "Authorize" e insira seu JWT token.

---

## 🎯 Próximos Passos

- [ ]  Implementar testes automatizados
- [ ]  Adicionar cache Redis
- [ ]  Implementar fila de processamento (Bull/BullMQ)
- [ ]  Adicionar rate limiting
- [ ]  Implementar logs estruturados
- [ ]  Configurar CI/CD

---

## 📄 Licença

Este projeto é apenas para fins educacionais, então fique a vontade para explorar :)

---

## Quer me ajudar?

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

