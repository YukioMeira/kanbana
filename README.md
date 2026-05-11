# Kanbana

Kanban board local com drag & drop, CRUD de cards, filtro por projeto e log de alterações.
Otimizado para uso por pessoas e agentes de IA.

## Setup

```bash
git clone <url>
cd kanbana
pnpm install   # ou npm install / yarn
pnpm dev
```

Abra `http://localhost:3000`.

> Os dados ficam em `data/items.json` — commite o arquivo para versionar o estado do board.

---

## API (para agentes)

Base URL: `http://localhost:3000/api`

### Projetos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/projects` | Lista todos os projetos |
| POST | `/projects` | Cria projeto |
| PATCH | `/projects/:id` | Atualiza projeto |
| DELETE | `/projects/:id` | Deleta projeto |

**POST /projects**
```json
{ "name": "Meu Projeto", "color": "#6366f1" }
```

### Cards (items)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/items` | Lista todos os cards |
| GET | `/items?project_id=proj-001` | Lista por projeto |
| POST | `/items` | Cria card |
| PATCH | `/items/:id` | Atualiza card (parcial) |
| DELETE | `/items/:id` | Deleta card |

**POST /items**
```json
{
  "title": "Implementar feature X",
  "project_id": "proj-001",
  "category": "feature",
  "priority": "high",
  "status": "pending",
  "size": "M",
  "description": "Contexto opcional"
}
```

**PATCH /items/:id** — todos os campos são opcionais:
```json
{ "status": "done" }
```

#### Valores válidos

| Campo | Valores |
|-------|---------|
| `category` | `feature` `debt` `bug` `idea` |
| `status` | `pending` `in_progress` `done` `on_hold` |
| `priority` | `critical` `high` `medium` `low` |
| `size` | `XS` `S` `M` `L` `XL` |

---

## Estrutura do `data/items.json`

```json
{
  "projects": [
    { "id": "proj-001", "name": "Nome", "color": "#6366f1", "created_at": "..." }
  ],
  "items": [
    {
      "id": "KB-001",
      "title": "Título do card",
      "project_id": "proj-001",
      "category": "feature",
      "status": "pending",
      "priority": "medium",
      "size": "S",
      "description": "Opcional",
      "created_at": "2025-01-01T12:00:00.000Z",
      "updated_at": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

Agentes podem editar `data/items.json` diretamente — o servidor recarrega o arquivo a cada requisição.

---

## Funcionalidades

- **Kanban** — 4 colunas: Pendente, Em progresso, Concluído, Em espera
- **Drag & drop** — arraste cards entre colunas
- **CRUD** — crie, edite e delete cards pela interface ou API
- **Projetos** — crie projetos com cor; filtre kanban e log por projeto
- **Log** — histórico de alterações com filtro de tempo (7d / 30d / tudo) e ordenação (recente, antigo, prioridade, status)
