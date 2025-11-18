# 🐶 API ResgataPet - Documentação Técnica Completa 🐱

A API **ResgataPet** é o core de uma plataforma dedicada à centralização de informações sobre animais de rua, ONGs de resgate e pessoas interessadas em adoção.

O sistema permite o registro de ocorrências, o acompanhamento do status dos animais, o registro de intenções de adoção e a gestão de doações

---

## ✨ Visão Geral do Projeto

* **Integrantes**: Gustavo, Joyce, Julia e Sanio
* **Status do Desenvolvimento**: Configuração do Banco de Dados / Implementação dos Endpoints Básicos
* **Link do Repositório**: [Inserir link do GitHub aqui]

### 💻 Stack Técnica

| Categoria | Tecnologia | Padrão Utilizado |
| :--- | :--- | :--- |
| **Backend** | Node.js, Express, Knex | Arquitetura RESTful  |
| **Banco de Dados** | PostgreSQL/MySQL | Relacional com Knex Migrations  |
| **Autenticação** | JWT (JSON Web Token) | Bearer Token no Header  |
| **Formato de Dados** | JSON | Respostas padronizadas  |
| **Paginação** | Query Params `?page=X&limit=Y` | Baseada em Offset/Limit  |
| **Segurança** | Hashing de Senha com `bcryptjs` | Senhas armazenadas de forma segura  |

---

## 🔑 Níveis de Acesso e Autenticação

Todos os usuários e ONGs se autenticam via **JWT**. Para acessar rotas protegidas, o `token` deve ser enviado no cabeçalho `Authorization: Bearer [TOKEN]`.

| Nível | Descrição | Permissões Chave |
| :--- | :--- | :--- |
| **ADMIN** | Dono do sistema. Acesso total. | Gerenciar ONGs, Usuários, e remover cadastros indevidos. |
| **ONG** | Gerencia os animais e adoções de sua própria ONG. | Cadastrar/Atualizar seus animais, ver e aprovar pedidos de adoção. |
| **COMUM** | Cidadão. | Registrar ocorrências, consultar animais, doar e solicitar adoção. |
| **PÚBLICO** | Visitante. | Visualizar a lista pública de animais e ONGs cadastradas. |

---

## 🗺️ Endpoints Implementados (Rotas V1)

A tabela abaixo detalha os principais endpoints da API.

### 1. Autenticação (`/auth`)

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Autentica um usuário/ONG e retorna o JWT. | **Público**  |

### 2. Usuários (`/usuarios`)

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/usuarios` | Lista todos os usuários (com paginação/filtros). | **ADMIN**  |
| `GET` | `/usuarios/:id` | Retorna dados do usuário por ID. | **Proprietário** ou **ADMIN**  |
| `POST` | `/usuarios` | Cadastra um novo usuário. | **Público**  |
| `PUT` | `/usuarios/:id` | Atualiza dados do usuário. | **Proprietário** ou **ADMIN**  |
| `DELETE` | `/usuarios/:id` | Remove um usuário. | **Proprietário** ou **ADMIN**  |

### 3. ONGs (`/ongs`)

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/ongs` | Lista todas as ONGs (com paginação/filtros). | **Público**  |
| `GET` | `/ongs/:id` | Retorna dados da ONG por ID. | **Público**  |
| `POST` | `/ongs` | Cadastra uma nova ONG. | **ADMIN**  |
| `PUT` | `/ongs/:id` | Atualiza dados da ONG. | **ONG** (Admin da ONG) ou **ADMIN**  |
| `DELETE` | `/ongs/:id` | Remove uma ONG. | **ADMIN**  |

### 4. Animais (`/animais`)

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/animais` | Lista todos os animais (com paginação/filtros). | **Público**  |
| `GET` | `/animais/:id` | Retorna detalhes do animal por ID. | **Público**  |
| `POST` | `/animais` | Cadastra um novo animal. | **ONG** ou **ADMIN**  |
| `PUT` | `/animais/:id` | Atualiza dados do animal. | **ONG** (para seus animais) ou **ADMIN**  |
| `DELETE` | `/animais/:id` | Remove um animal. | **ADMIN**  |
| `POST` | `/animais/:id/prioridade` | Define a prioridade de resgate. | **ONG** ou **ADMIN**  |

### 5. Ocorrências (`/ocorrencias`)

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/ocorrencias` | Lista todas as ocorrências (com filtros). | **Público** (filtrado), **ONG**, **ADMIN**  |
| `GET` | `/ocorrencias/:id` | Retorna detalhes da ocorrência por ID. | **Público** (filtrado), **ONG**, **ADMIN**  |
| `POST` | `/ocorrencias` | **Registra** uma nova ocorrência de animal. | **COMUM** ou **Anônimo**  |
| `PUT` | `/ocorrencias/:id/status` | Atualiza o status da ocorrência. | **ONG** ou **ADMIN**  |
| `DELETE` | `/ocorrencias/:id` | Remove uma ocorrência. | **ADMIN**  |

### 6. Adoções (`/adocoes`)

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/adocoes` | Lista todas as solicitações de adoção (com filtros). | **ONG** ou **ADMIN**  |
| `GET` | `/adocoes/:id` | Retorna detalhes da solicitação por ID. | **Proprietário** (solicitante), **ONG**, **ADMIN**  |
| `POST` | `/adocoes` | Registra uma intenção de adoção. | **COMUM**  |
| `PUT` | `/adocoes/:id/status` | Atualiza o status da solicitação. | **ONG** ou **ADMIN**  |
| `DELETE` | `/adocoes/:id` | Remove uma solicitação de adoção. | **ADMIN**  |

### 7. Doações (`/doacoes`)

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/ongs/:id/doacoes` | Registra uma doação para uma ONG. | **COMUM** ou **Anônimo**  |
| `GET` | `/ongs/:id/doacoes` | Lista as doações recebidas pela ONG. | **ONG** (própria) ou **ADMIN**  |
| `GET` | `/doacoes/:id` | Retorna doação por ID. | **Público** |

### 8. Prioridades (`/prioridades`)

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/prioridades` | Lista todas as categorias de prioridade. | **Público**  |
| `GET` | `/prioridades/:id` | Retorna detalhes da prioridade por ID. | **Público**  |
| `POST` | `/prioridades` | Cadastra uma nova categoria de prioridade. | **ADMIN**  |
| `PUT` | `/prioridades/:id` | Atualiza uma categoria de prioridade. | **ADMIN**  |
| `DELETE` | `/prioridades/:id` | Remove uma categoria de prioridade. | **ADMIN**  |

---

## 📊 Estrutura de Resposta Padrão

### Resposta de Sucesso (200 OK, 201 Created, etc.)

```json
{
  "success": true,
  "message": "Operação realizada com sucesso!",
  "data": { 
    // ... Corpo do objeto retornado
  },
  "pageInfo": { 
    // ... Se for uma lista paginada
    "total": 100,
    "limit": 10,
    "page": 1,
    "totalPages": 10
  }
}