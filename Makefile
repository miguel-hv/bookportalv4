# ──────────────────────────────────────────────
# BookPortal v4 — Docker Makefile
# ──────────────────────────────────────────────
# Profiles:  dev  |  pro
# Services:
#   dev → db-dev, backend-dev, frontend-dev
#   pro → db-pro, backend-pro, frontend-pro, nginx
# ──────────────────────────────────────────────

DC       := docker compose -f docker/docker-compose.yml
DC_DEV   := $(DC) --profile dev
DC_PRO   := $(DC) --profile pro

# ──────────────────────────────────────────────
# 🚀  Up
# ──────────────────────────────────────────────

.PHONY: up-dev
up-dev:                ## Levantar entorno dev (db + backend + frontend)
	$(DC_DEV) up -d

.PHONY: up-pro
up-pro:                ## Levantar entorno pro (db + backend + frontend + nginx)
	$(DC_PRO) up -d

.PHONY: up
up: up-dev             ## Por defecto: levanta dev

# ──────────────────────────────────────────────
# ⏹  Down
# ──────────────────────────────────────────────

.PHONY: down
down:                  ## Bajar todos los servicios
	$(DC) down

.PHONY: down-volumes
down-volumes:          ## Bajar servicios y eliminar volúmenes
	$(DC) down -v

# ──────────────────────────────────────────────
# 🔨  Build (pro)
# ──────────────────────────────────────────────

.PHONY: build
build:                 ## Construir imágenes pro (backend + frontend)
	$(DC_PRO) build

.PHONY: build-backend
build-backend:         ## Construir solo backend pro
	$(DC_PRO) build backend-pro

.PHONY: build-frontend
build-frontend:        ## Construir solo frontend pro
	$(DC_PRO) build frontend-pro

# ──────────────────────────────────────────────
# 📋  Logs
# ──────────────────────────────────────────────

.PHONY: logs
logs:                   ## Logs de todos los servicios
	$(DC) --profile dev --profile pro logs -f

.PHONY: logs-backend
logs-backend:          ## Logs del backend (dev)
	$(DC_DEV) logs -f backend-dev

.PHONY: logs-frontend
logs-frontend:         ## Logs del frontend (dev)
	$(DC_DEV) logs -f frontend-dev

.PHONY: logs-db
logs-db:               ## Logs de la db (dev)
	$(DC_DEV) logs -f db-dev

.PHONY: logs-nginx
logs-nginx:            ## Logs de nginx (pro)
	$(DC_PRO) logs -f nginx

# ──────────────────────────────────────────────
# 🔄  Restart
# ──────────────────────────────────────────────

.PHONY: restart-backend
restart-backend:       ## Reiniciar backend (dev)
	$(DC_DEV) restart backend-dev

.PHONY: restart-frontend
restart-frontend:      ## Reiniciar frontend (dev)
	$(DC_DEV) restart frontend-dev

.PHONY: restart-db
restart-db:            ## Reiniciar db (dev)
	$(DC_DEV) restart db-dev

# ──────────────────────────────────────────────
# 🧹  Clean
# ──────────────────────────────────────────────

.PHONY: clean
clean: down            ## Bajar todo y limpiar imágenes no usadas
	docker system prune -f

.PHONY: clean-all
clean-all: down-volumes   ## Bajar todo, volúmenes + imágenes + caché
	docker system prune -af --volumes

# ──────────────────────────────────────────────
# 🔍  Status
# ──────────────────────────────────────────────

.PHONY: ps
ps:                    ## Listar contenedores activos del proyecto
	$(DC) ps

.PHONY: status
status: ps             ## Alias de ps

.PHONY: images
images:                ## Listar imágenes del proyecto
	$(DC) images

# ──────────────────────────────────────────────
# 🛠  Utils
# ──────────────────────────────────────────────

.PHONY: test-backend
test-backend:          ## Tests del backend (dev)
	$(DC_DEV) exec -e SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb backend-dev mvn test

.PHONY: test-frontend
test-frontend:         ## Tests del frontend (dev)
	$(DC_DEV) exec frontend-dev npx jest --no-cache

.PHONY: test
test: test-backend test-frontend  ## Tests de backend + frontend

.PHONY: exec-backend
exec-backend:          ## Shell dentro del backend (dev)
	$(DC_DEV) exec backend-dev sh

.PHONY: exec-frontend
exec-frontend:         ## Shell dentro del frontend (dev)
	$(DC_DEV) exec frontend-dev sh

.PHONY: exec-db
exec-db:               ## psql dentro de la db (dev)
	$(DC_DEV) exec db-dev psql -U bookportal -d bookportal

.PHONY: db-reset
db-reset:              ## Resetear base de datos (dev) y reiniciar backend para que corran migrations + seed
	$(DC_DEV) stop db-dev
	$(DC_DEV) rm -f db-dev
	docker volume rm bookportalv4_pgdata-dev -f
	$(DC_DEV) up -d db-dev
	$(DC_DEV) restart backend-dev

.PHONY: db-migrate
db-migrate:            ## Ejecutar scripts de init sobre db-dev (forzado)
	$(DC_DEV) exec db-dev psql -U bookportal -d bookportal -f /docker-entrypoint-initdb.d

# ──────────────────────────────────────────────
# ❓  Help
# ──────────────────────────────────────────────

.PHONY: help
help:                  ## Mostrar esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
