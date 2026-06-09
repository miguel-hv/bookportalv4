# Bookportal v4

This app is a learning project so I can practise AI agentic development and study backend at the same time. The main goal is to understand the building of a backend project with industry production standards, so a thesis will be generated explaining the decissions taken and discussing the tradeoffs of each one.
The goal is to plan and think patienly so I understand every code generated for the project.

## App

It's a book portal with several roles where the basic idea is that a user can publish book reviews. Around this idea will be built whatever I feel like learning. 

## Architecture

Java backend, postgres database, Nextjs frontend with tailwind, docker with dev and pro environments

## Run with Docker (recommended)

### Prerequisites

- Docker & Docker Compose

### Dev environment (hot-reload)

```bash
# Levantar todo (db + backend + frontend)
make up-dev

# Ver logs
make logs

# Logs de un servicio específico
make logs-backend
make logs-frontend
make logs-db

# Reiniciar un servicio
make restart-backend

# Bajar todo
make down
```

### Pro environment (multi-stage, con Nginx)

```bash
make build    # Construir imágenes
make up-pro   # Levantar con Nginx
```

### Otros comandos útiles

```bash
make ps           # Estado de contenedores
make exec-db      # psql directo a la db
make clean        # Bajar + limpiar imágenes no usadas
make help         # Lista completa de comandos
```

También podés usar `docker compose` directamente:

```bash
docker compose -f docker/docker-compose.yml --profile dev up -d
docker compose -f docker/docker-compose.yml down
```

## Run without Docker

### Prerequisites

- Java 21 + Maven
- Node.js 20 + pnpm (`npm install -g pnpm`)
- PostgreSQL 16 corriendo en puerto `5433`

### 1. Base de datos

```bash
# Asegurate de tener PostgreSQL corriendo en localhost:5433
# y una base llamada "bookportal" con usuario "bookportal" / pass "bookportal"
# o variables de entorno: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, DB_PORT_DEV

# Inicializar esquema:
psql -U bookportal -d bookportal -h localhost -p 5433 -f database/init/001-init.sql
```

### 2. Backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# Arranca en http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev
# Arranca en http://localhost:3000
```

## Agents

Using [Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai/blob/main). Vas a ver que los textos están en argentino jajjaj

## Conclusions and thoughts

I see how I should be doing a figma before the webpage; at least, some schema displaying what I need so I can come up with all the needed tasks aupfront. Right now I'm creating tasks as I progress and see the needs for them, but I lacked the full picture when planning at the start. 
