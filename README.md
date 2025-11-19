# 🐶 API ResgataPet - Documentação Técnica Completa 🐱

## 1. Introdução

A **API ResgataPet** é uma plataforma RESTful desenvolvida para gerenciar e centralizar informações sobre a causa animal, facilitando o registro de ocorrências, adoções e doações entre a comunidade e ONGs parceiras.

### Stack Tecnológica

| Categoria | Tecnologia | Versão | Função no Projeto |
|-----------|-----------|--------|-------------------|
| Linguagem | TypeScript | ^5.9.3 | Tipagem e segurança no desenvolvimento |
| Backend | Node.js + Express | ^5.1.0 | Servidor e motor de roteamento |
| Banco de Dados | Knex + pg (PostgreSQL) | ^3.1.0, ^8.16.3 | Query Builder e Driver para conexão |
| Autenticação | JWT + bcryptjs | ^9.0.2, ^3.0.3 | Geração de token e hash seguro de senhas |
| Desenvolvimento | ts-node-dev, dotenv | ^2.0.0, ^17.2.3 | Ambiente de desenvolvimento e variáveis de ambiente |

### Objetivo

Resolver o problema de centralizar dados de animais de rua, facilitar o registro de ocorrências anônimas ou de usuários, e controlar o fluxo de adoções e doações.

---

## 2. Arquitetura

O projeto adota uma **arquitetura em 3 Camadas (MVC-style)** para garantir clareza e manutenibilidade, seguindo o princípio da Separação de Responsabilidades.

### Estrutura de Pastas

```
src/
├── business/         # 🧠 Regras de Negócio e Orquestração
├── controller/       # 🌐 Manipuladores HTTP
├── data/             # 💾 Acesso ao Banco de Dados (Repository)
├── database/         # ⚙️ Migrations e Seeds do Knex
├── dto/              # 📦 Data Transfer Objects
├── middlewares/      # 🔐 Autenticação e Autorização
├── routes/           # 🔗 Definição de Rotas
├── types/            # 🏷️ Interfaces e Tipagens
└── utils/            # 🛠️ Funções utilitárias
```

### Fluxo de uma Requisição

1. **Requisição**: Cliente envia requisição HTTP para um endpoint
2. **Routes**: Express encontra a rota e executa Middleware
3. **Middlewares**: Verificam identidade e permissões (AuthMiddleware, AuthorizationMiddleware)
4. **Controller**: Valida parâmetros e chama a camada Business
5. **Business**: Aplica regras de negócio e chama a camada Data
6. **Data**: Executa comandos SQL via Knex e retorna dados
7. **Resposta**: Controller formata resultado em JSON e envia resposta

---

## 3. Como Rodar o Projeto

### 1. Clonar o Repositório

```bash
git clone [seu-link-do-repositorio]
cd resgatapet_api
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configuração do .env

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Servidor Express
PORT=3003

# Configurações do Banco de Dados (PostgreSQL)
DB_CLIENT=pg
DB_HOST=IP_OU_HOST_DO_BANCO
DB_PORT=5432
DB_DATABASE=resgatapet_db
DB_USER=seu_usuario_compartilhado
DB_PASSWORD=

# Configurações de Segurança (JWT e Senha)
JWT_SECRET=sua_chave_secreta_super_aleatoria_aqui
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

### 4. Rodar Migrations e Seeds

```bash
# Cria as tabelas no banco de dados
npx knex migrate:latest --knexfile knexfile.ts

# Popula o banco com usuários de teste (ADMIN, ONG, COMUM)
npx knex seed:run --knexfile knexfile.ts
```

### 5. Iniciar o Servidor

```bash
npm run dev
```

---

## 4. Autenticação e Autorização

### Fluxo de Login (JWT)

A API utiliza o endpoint `POST /auth/login` para autenticar usuários. A senha é comparada com o hash armazenado usando bcrypt. Se bem-sucedida, um JSON Web Token (JWT) é retornado.

**Envio do Token:**

Inclua o token no cabeçalho Authorization de todas as requisições protegidas:

```
Authorization: Bearer <TOKEN_JWT_GERADO_NO_LOGIN>
```

### Perfis de Acesso e Permissões

| Perfil | Acesso no Código | Ações de Exemplo |
|--------|------------------|------------------|
| ADMIN | `authorize('ADMIN')` | Listar todos os usuários, criar ONGs, deletar animais |
| ONG | `authorize('ONG', 'ADMIN')` | Criar animais, atualizar status de adoção |
| COMUM | `authorize('COMUM')` | Registrar adoção |
| Proprietário | `authorizeOwner` | GET, PUT, DELETE em seus próprios dados |

---

## 5. Modelos de Dados

### 1. Usuário

```json
{
  "id_usuario": 1,
  "nome": "Admin Master",
  "email": "admin@resgatapet.com",
  "tipo": "ADMIN",
  "senha": "$2a$10$...",
  "data_criacao": "2025-11-18T10:00:00.000Z"
}
```

### 2. ONG

| Campo | Tipo | Exemplo |
|-------|------|---------|
| id_ong | number | 1 |
| nome | string | "Abrigo Doce Lar" |
| email | string | "doce_lar@email.com" |
| endereco | string | "Rua Principal, 456" |
| telefone | string | "31988887777" |
| usuario_id | number | 2 (FK) |

### 3. Animal

| Campo | Tipo | Exemplo |
|-------|------|---------|
| id_animal | number | 2 |
| nome | string | "Miau" |
| especie | string | "Gato" |
| descricao | string | "Gato Siamês, busca adoção" |
| status | string | "disponivel" |
| localizacao | string | "Belo Horizonte" |
| data_registro | Date | "2025-11-18T10:00:00.000Z" |
| ong_id | number | 1 (FK) |

### 4. Ocorrência

| Campo | Tipo | Exemplo |
|-------|------|---------|
| id_ocorrencia | number | 1 |
| descricao | string | "Filhote abandonado" |
| localizacao | string | "Praça da Sé, SP" |
| foto_url | string | "http://foto.com/123.jpg" |
| status | string | "encontrado" |
| usuario_id | number | undefined |
| ong_id | number | undefined |
| animal_id | number | undefined |
| data_registro | Date | "2025-11-18T12:00:00.000Z" |

### 5. Doação

| Campo | Tipo | Exemplo |
|-------|------|---------|
| id_doacao | number | 1 |
| tipo | string | "financeira" |
| data_doacao | Date | "2025-11-18T15:00:00.000Z" |
| usuario_id | number | undefined |
| ong_id | number | 1 (FK) |
| valor | number | undefined |
| descricao | string | undefined |

### 6. Adoção

| Campo | Tipo | Exemplo |
|-------|------|---------|
| id_adocao | number | 1 |
| data_solicitacao | Date | "2025-11-18T16:00:00.000Z" |
| ong_id | number | undefined |
| animal_id | number | undefined |
| usuario_id | number | undefined |
| status | string | "em análise" |

### 7. Prioridade

| Campo | Tipo | Exemplo |
|-------|------|---------|
| id_prioridade | number | 1 |
| animal_id | number | undefined |
| descricao | string | "Requer cirurgia urgente" |
| nivel | string | "Alta" |

---

## 6. Endpoints

### 6.1. Autenticação (/auth)

| Método | Rota | Permissão | Status Codes |
|--------|------|-----------|--------------|
| POST | /auth/login | Público | 200, 400 |

**Parâmetros (Body):**

```json
{
  "email": "string",
  "senha": "string"
}
```

**Erros Possíveis:**
- `400 Bad Request`: Email/senha ausentes ou credenciais inválidas

---

### 6.2. Usuários (/usuarios)

| Método | Rota | Permissão | Status Codes |
|--------|------|-----------|--------------|
| GET | /usuarios | ADMIN | 200, 500 |
| GET | /usuarios/:id | Proprietário ou ADMIN | 200, 400, 403, 404 |
| POST | /usuarios | Público | 201, 400, 409 |
| PUT | /usuarios/:id | Proprietário ou ADMIN | 200, 400, 404, 409 |
| DELETE | /usuarios/:id | Proprietário ou ADMIN | 204, 400, 403, 404 |

**Parâmetros Query (GET /usuarios):** `page`, `limit`, `name`, `email`, `sortBy`, `sortOrder`

**Parâmetros Body (POST /usuarios):**

```json
{
  "nome": "string",
  "email": "string",
  "senha": "string",
  "tipo": "string"
}
```

**Erros Possíveis:**
- `409 Conflict`: Email já cadastrado
- `403 Forbidden`: Tentativa de deletar conta ADMIN

---

### 6.3. ONGs (/ongs)

| Método | Rota | Permissão | Status Codes |
|--------|------|-----------|--------------|
| GET | /ongs | Público | 200, 500 |
| GET | /ongs/:id | Público | 200, 400, 404 |
| POST | /ongs | ADMIN | 201, 400, 409 |
| PUT | /ongs/:id | ONG (Admin da ONG) ou ADMIN | 200, 400, 403, 404, 409 |
| DELETE | /ongs/:id | ADMIN | 204, 400, 404 |

**Parâmetros Body (POST/PUT):**

```json
{
  "nome": "string",
  "email": "string",
  "endereco": "string",
  "telefone": "string",
  "usuario_id": 1
}
```

---

### 6.4. Doações

| Método | Rota | Permissão | Status Codes |
|--------|------|-----------|--------------|
| GET | /ongs/:id/doacoes | ONG ou ADMIN | 200, 500 |
| GET | /doacoes/:id | Público | 200, 400, 404 |
| POST | /ongs/:id/doacoes | Público (COMUM ou Anônimo) | 201, 400, 500 |

**Parâmetros Query (GET /ongs/:id/doacoes):** `page`, `limit`, `tipo`, `usuario_id`, `sortBy`, `sortOrder`

**Parâmetros Body (POST):**

```json
{
  "tipo": "string",
  "usuario_id": 3,
  "valor": 50.00,
  "descricao": "string"
}
```

---

### 6.5. Animais (/animais)

| Método | Rota | Permissão | Status Codes |
|--------|------|-----------|--------------|
| GET | /animais | Público | 200, 500 |
| GET | /animais/:id | Público | 200, 400, 404 |
| POST | /animais | ONG ou ADMIN | 201, 400, 500 |
| PUT | /animais/:id | ONG ou ADMIN | 200, 400, 404 |
| DELETE | /animais/:id | ADMIN | 204, 400, 404 |
| POST | /animais/:id/prioridade | ONG ou ADMIN | 200, 400, 404, 500 |

**Parâmetros Query (GET /animais):** `page`, `limit`, `nome`, `especie`, `status`, `ong_id`, `sortBy`, `sortOrder`

**Parâmetros Body (POST /animais):**

```json
{
  "nome": "string",
  "especie": "string",
  "status": "string",
  "localizacao": "string",
  "ong_id": 1,
  "descricao": "string"
}
```

---

### 6.6. Ocorrências (/ocorrencias)

| Método | Rota | Permissão | Status Codes |
|--------|------|-----------|--------------|
| GET | /ocorrencias | Público | 200, 500 |
| GET | /ocorrencias/:id | Público | 200, 400, 404 |
| POST | /ocorrencias | Público (COMUM ou Anônimo) | 201, 400, 500 |
| PUT | /ocorrencias/:id/status | ONG ou ADMIN | 200, 400, 404 |
| DELETE | /ocorrencias/:id | ADMIN | 204, 400, 404 |

**Parâmetros Body (PUT /ocorrencias/:id/status):**

```json
{
  "status": "em andamento"
}
```

---

### 6.7. Adoções (/adocoes)

| Método | Rota | Permissão | Status Codes |
|--------|------|-----------|--------------|
| GET | /adocoes | ONG ou ADMIN | 200, 500 |
| GET | /adocoes/:id | Proprietário, ONG, ADMIN | 200, 400, 404 |
| POST | /adocoes | COMUM | 201, 400, 500 |
| PUT | /adocoes/:id/status | ONG ou ADMIN | 200, 400, 404 |
| DELETE | /adocoes/:id | ADMIN | 204, 400, 404 |

**Parâmetros Body (POST /adocoes):**

```json
{
  "animal_id": 1,
  "usuario_id": 2,
  "status": "em análise"
}
```

---

### 6.8. Prioridades (/prioridades)

| Método | Rota | Permissão | Status Codes |
|--------|------|-----------|--------------|
| GET | /prioridades | Público | 200, 500 |
| GET | /prioridades/:id | Público | 200, 400, 404 |
| POST | /prioridades | ADMIN | 201, 400, 500 |
| PUT | /prioridades/:id | ADMIN | 200, 400, 404 |
| DELETE | /prioridades/:id | ADMIN | 204, 400, 404 |

---

## 7. Paginação

Todas as rotas de listagem utilizam o padrão **Offset-based (Page/Limit)**.

### Parâmetros Query

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| page | 1 | Número da página |
| limit | 10 | Número máximo de itens por página |
| sortBy | id_recurso | Campo para ordenação |
| sortOrder | asc ou desc | Direção da ordenação |

### Formato de Resposta

```json
{
  "data": [
    {
      "id_ong": 1,
      "nome": "ONG Abrigo Feliz",
      "email": "contato@abrigofeliz.com",
      "endereco": "Rua Principal, 456 - Bairro",
      "telefone": "31988887777",
      "usuario_id": 2
    }
  ],
  "pageInfo": {
    "total": 5,
    "limit": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

---

## 8. Boas Práticas do Projeto

- **Validações Centralizadas**: Classe `ErrorUtils` acumula erros em um único ponto
- **Hash de Senhas**: Todas as senhas são hasheadas com bcryptjs
- **Tratamento de Erros Padronizado**: Formato `{"success": false, "message": "...", "errors": [...]}`
- **Middlewares de Segurança**: `AuthMiddleware` verifica JWT, `AuthorizationMiddleware` restringe acesso
- **DTOs**: Interfaces específicas definem contratos de dados em cada operação

---

## 9. Exemplos de Requisições

### A. Autenticação e Login

```bash
curl -X POST 'http://localhost:3003/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "admin@resgatapet.com",
    "senha": "123456"
}'
```

**Resposta (200 OK):**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "nome": "Admin Master",
        "email": "admin@resgatapet.com",
        "tipo": "ADMIN"
    }
}
```

### B. Listar Animais com Paginação

```bash
curl -X GET 'http://localhost:3003/animais?page=1&limit=2&sortBy=nome&sortOrder=asc'
```

**Resposta (200 OK):**

```json
{
    "data": [
        {
            "id_animal": 2,
            "nome": "Miau",
            "especie": "Gato",
            "descricao": "Gato Siamês, busca adoção.",
            "status": "disponivel",
            "localizacao": null,
            "data_registro": "2025-11-18T10:00:00.000Z",
            "ong_id": 1
        },
        {
            "id_animal": 1,
            "nome": "Rex",
            "especie": "Cachorro",
            "descricao": "Pastor Alemão, dócil.",
            "status": "resgatado",
            "localizacao": null,
            "data_registro": "2025-11-18T10:00:00.000Z",
            "ong_id": 1
        }
    ],
    "pageInfo": {
        "total": 3,
        "limit": 2,
        "page": 1,
        "totalPages": 2
    }
}
```

---

## 10. Como Contribuir

1. Faça o Fork do repositório
2. Crie uma Branch: `git checkout -b feature/nome-da-feature`
3. Garanta que suas implementações sigam o padrão de 3 Camadas (Controller/Business/Data)
4. Use TypeScript
5. Execute os testes e migrações
6. Crie um Pull Request para a branch `main`

---

## 11. Integrantes do Projeto

Este projeto foi desenvolvido como trabalho acadêmico da disciplina **Desenvolvimento de API** da **Faculdade FAMINAS**.

### Equipe de Desenvolvimento

- **Joyce**
- **Julia**
- **Sanio**
- **Gustavo**

---

## 12. Licença

Este projeto está licenciado sob a **Licença MIT**.