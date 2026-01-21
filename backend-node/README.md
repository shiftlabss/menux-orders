# Menux Backend - Modern Node.js Architecture

Reescrita completa do backend Menux utilizando **Node.js**, **TypeScript**, **DDD** e **Clean Architecture**.

## 🚀 Tecnologias

- **Runtime**: Node.js v20+
- **Linguagem**: TypeScript (Strict Mode)
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL (TypeORM)
- **Cache**: Redis
- **Mensageria**: RabbitMQ
- **Testes**: Jest
- **Docs**: Swagger/OpenAPI

## 🏗 Arquitetura

O projeto segue estritamente os princípios de **Clean Architecture** e **Domain-Driven Design**.

```
src/
├── domain/             # Regras de Negócio Puras (Entities, Repositories Interfaces)
├── application/        # Use Cases (Orquestração)
├── infrastructure/     # Implementações Técnicas (DB, Cache, Queue)
├── interfaces/         # Entrypoints (API, Controllers, Validators)
└── shared/             # Utilitários Globais (Logger, Config, Errors)
```

## 🛠 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose

### Instalação

```bash
cd backend-node
npm install
```

### Subindo Infraestrutura (Docker)

```bash
docker compose up -d
```

Isso iniciará:

- Postgres (Porta 5432)
- Redis (Porta 6379)
- RabbitMQ (Porta 5672/15672 Management)

### Rodando a Aplicação

```bash
# Modo Desenvolvimento
npm run dev
```

A API estará disponível em: `http://localhost:3000/api/v1`
Documentação Swagger: `http://localhost:3000/api/docs`

## 🧪 Testes

```bash
# Testes Unitários
npm test
```

## 📦 Variáveis de Ambiente

Copie o `.env.example` para `.env` (se existir) ou configure as variáveis necessárias:

- `NODE_ENV`: development/production
- `PORT`: Porta da API
- `DATABASE_URL`: URL de conexão Postgres
- `REDIS_URL`: URL de conexão Redis
- `RABBITMQ_URL`: URL de conexão RabbitMQ
- `JWT_SECRET`: Segredo para assinatura de tokens
- `LOG_LEVEL`: Nível de log (info, debug)

## 🔄 Migrations

```bash
# Gerar migration (após alterar entidades)
npm run migration:generate -- -n NomeDaMigration

# Rodar migrations
npm run migration:run
```
