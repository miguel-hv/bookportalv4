# Bookportal v4 — Thesis

> Conceptos clave de programación y arquitectura aplicados en este proyecto. Cada sección es un tema que podés buscar para profundizar.

## Stack Decisiones

### ¿Por qué Spring Boot sobre Java EE / Quarkus / Micronaut?

Spring Boot es el _opinionated framework_ dominante en el ecosistema Java. Baja la barrera de entrada con:
- **Auto-configuration**: infiere beans según las dependencias en classpath
- **Embedded Tomcat**: no necesitas deployar un WAR en un servidor externo
- **DevTools**: hot-reload automático en desarrollo

Alternativas como Quarkus o Micronaut están optimizadas para startups fríos rápidos (útil en serverless) y menor footprint de memoria, pero Spring Boot gana en ecosistema, documentación y comunidad.

**Para investigar**: Inversión de Control (IoC), Dependency Injection, Auto-configuration, Spring Boot vs Quarkus.

### ¿Por qué Next.js App Router sobre Pages Router?

App Router es el routing moderno de Next.js, estable desde 14.x. Usa:
- **Server Components por defecto**: renderizado en servidor, menos JS enviado al cliente
- **Layouts anidados**: persistencia de estado entre rutas
- **Streaming**: carga progresiva de contenido

Acá usamos `'use client'` en la landing page para el fetching del lado del cliente, cosa que _opta out_ del server component — tradeoff válido porque es un componente interactivo.

**Para investigar**: Server Components vs Client Components, RSC (React Server Components), Streaming SSR, App Router architecture.

### ¿Por qué pnpm sobre npm/yarn?

pnpm resuelve tres problemas de npm/yarn:
1. **Disk efficiency**: usa un store global con hard links — no duplica `node_modules` por proyecto
2. **Strictness**: no permite que los imports usen dependencias de dependencias (hoisting bypass)
3. **Speed**: resolución de dependencias en paralelo

**Para investigar**: pnpm store vs flat node_modules, symbolic link `node_modules`, hoisting behavior.

## Arquitectura de Proyecto

### Docker Compose Profiles

Usamos un solo `docker-compose.yml` con dos perfiles (`dev` y `pro`) seleccionables via `--profile`. Esto evita duplicar la configuración de la base de datos (compartida entre perfiles) mientras permite comportamientos distintos:

| Aspecto | Dev | Pro |
|---|---|---|
| Backend | `mvn spring-boot:run` con volúmenes | JAR compilado multi-stage |
| Frontend | `next dev` + HMR | Static build, standalone server |
| Proxy | Acceso directo a puertos | nginx reverse proxy |

**Por qué no usar dos archivos separados** (docker-compose.dev.yml + docker-compose.prod.yml):
- La composición de múltiples archivos de compose requiere `-f` flags extra y es más fácil de romper
- Con profiles, un solo comando:
  - Dev: `docker compose --profile dev up`
  - Pro: `docker compose --profile pro up`
- La base de datos se comparte sin duplicar configuración

**Para investigar**: Docker Compose profiles, multi-file compose, service dependencies con profiles.

### Multi-stage Builds

Usamos dos Dockerfiles con multi-stage build. Esto es estándar en producción por:
1. **Imagen final mínima**: solo el runtime, no el SDK/build tools
2. **Seguridad**: menos superficie de ataque (no hay compiladores, no hay `npm install` en producción)
3. **Caché de capas eficiente**: las dependencias se cachean separadas del código fuente

Backend: `maven:3.9.9-eclipse-temurin-21-alpine` (build) → `eclipse-temurin:21-jre-alpine` (run)
Frontend: `node:20-alpine` (build + install) → `node:20-alpine` (run con standalone output)

El `output: 'standalone'` de Next.js copia solo lo necesario a `/.next/standalone/`, reduciendo drásticamente el tamaño de la imagen final.

**Para investigar**: Docker multi-stage builds, layer caching, distroless images, Next.js standalone output.

### Nginx como Reverse Proxy

En el perfil `pro`, nginx recibe todo el tráfico en puerto 80 y distribuye:
- `/` → Next.js frontend (proxy_pass a `frontend-pro:3000`)
- `/api/` → Spring Boot backend (proxy_pass a `backend-pro:8080`)

Esto es un patrón **Gateway/Reverse Proxy** común en microservicios. Ventajas:
- **Single entry point**: el browser solo ve un origen → sin CORS issues
- **Routing centralizado**: el frontend usa rutas relativas (`/api/welcome`) en vez de URLs absolutas con CORS
- **Abstracción**: los servicios internos pueden cambiar de puerto/host sin afectar al cliente

El side-effect conocido es que `NEXT_PUBLIC_*` variables de Next.js se hornean en build time, así que no pueden depender de runtime env vars. Por eso en pro usamos ruta relativa.

**Para investigar**: Reverse proxy pattern, API Gateway pattern, CORS, nginx location blocks, upstreams.

### CORS en Dev

En dev no hay nginx — el frontend (puerto 3000) y backend (puerto 8080) son orígenes diferentes para el browser. Por eso necesitamos CORS en el backend:

```java
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000")
                    ...
```

En pro, como nginx unifica los orígenes, CORS no es necesario.

**Para investigar**: CORS (Cross-Origin Resource Sharing), Same-Origin Policy, preflight requests, CORS vs reverse proxy.

### Hot Reload en Docker con Volúmenes

El hot-reload en Docker requiere configuración extra porque el filesystem overlay de Docker no soporta `inotify` (eventos de cambio de archivos).

**Backend**: `SPRING_DEVTOOLS_RESTART_POLL_INTERVAL=2s` hace que devtools _polvee_ los archivos cada 2 segundos en vez de esperar eventos del filesystem.

**Frontend**: `WATCHPACK_POLLING=true` hace que webpack (usado por Next.js internamente) también polvee cambios.

**Para investigar**: spring-boot-devtools restart vs live reload, Docker volume mounts vs bind mounts, inotify vs polling, filesystem events en Docker.

### PostgreSQL con Init Scripts

PostgreSQL oficial permite montar scripts SQL en `/docker-entrypoint-initdb.d/`. Se ejecutan en orden alfabético la primera vez que el contenedor arranca con un volumen vacío. Esto nos da:

- **Schema versioning tácito**: los scripts numerados (`001-init.sql`, `002-*.sql`) se ejecutan en orden
- **Idempotencia**: usamos `CREATE TABLE IF NOT EXISTS` para poder reiniciar sin errores

**Para investigar**: PostgreSQL docker-entrypoint-initdb.d, schema migration tools (Flyway, Liquibase), idempotent DDL.

### `output: 'standalone'` de Next.js

Next.js en producción produce una carpeta `/.next/standalone/` que contiene:
- El server de Next.js compilado
- Las rutas estáticas (`.html`, `.json`)
- `node_modules` reducido a lo necesario
- `server.js` como entrypoint

Esto permite correr `node server.js` sin tener Next.js instalado — ideal para Docker.

**Para investigar**: Next.js standalone output, automatic static optimization, server actions vs API routes.

## Autenticación Frontend

### Backend for Frontend (BFF)

```mermaid
Browser ──GET /api/auth/session──→ Next.js API Route
                                       │
                                       ▼  fetch() server-side
                                    Spring Boot (/api/auth/me)
                                       │
                                       ▼
Browser ←── httpOnly cookie + JSON ──
```

El **BFF** es una capa intermedia que vive en el mismo servidor que el frontend (en nuestro caso, Next.js API Routes). El browser nunca habla directo con el backend de Java para auth — todo pasa por Next.js del lado del servidor.

**¿Por qué?**
- El token JWT nunca llega al browser → eliminás el vector XSS de localStorage
- Las httpOnly cookies se envían automáticamente en cada request (mismo origin)
- La lógica de refresh/expiración queda server-side, invisible para el cliente

**¿Cuándo NO usarlo?**
- Cuando el backend y frontend comparten el mismo dominio (sin CORS)
- En proyectos chicos donde la seguridad extra no justifica la complejidad
- Cuando usás un API Gateway que ya maneja auth (Kong, Zuul, etc.)

**Para investigar**: BFF pattern, Backend for Frontend (Sam Newman), API Gateway vs BFF, httpOnly cookies vs localStorage, XSS attack vectors.

### httpOnly Cookies vs localStorage

| Aspecto | localStorage | httpOnly Cookie |
|---------|-------------|-----------------|
| Acceso JS | ✅ Lectura/escritura directa | ❌ Inaccesible |
| XSS | 🚫 Token robado si hay XSS | ✅ Seguro |
| CSRF | ✅ No aplica | ⚠️ Requiere SameSite |
| Envío automático | ❌ Hay que inyectar header | ✅ El browser lo hace |
| Expiración | Manual | Server-set via maxAge |
| Multi-tab | Compartido | Compartido |

La regla práctica: **httpOnly cookies para tokens de auth, localStorage para preferencias de usuario (tema, idioma, etc.)**.

**Para investigar**: httpOnly flag, SameSite cookies (Strict vs Lax vs None), CSRF attacks, XSS vs CSRF.

### El patrón `/api/auth/me` (Session Endpoint)

Es el endpoint que responde "¿quién soy?" validando el token contra la base de datos. Es un **patrón universal**:

| Plataforma | Endpoint |
|---|---|
| Auth0 | `/userinfo` |
| Firebase | `onAuthStateChanged()` |
| Supabase | `GET /auth/v1/user` |
| Microsoft Graph | `GET /me` |
| Nuestro BFF | `GET /api/auth/session` |

**¿Por qué no alcanza con decodificar el JWT en el cliente?**
- El JWT tiene datos estáticos desde que se emitió
- Si el usuario cambió su nombre, o lo bannearon, el JWT no lo sabe
- `/me` te da la verdad actual desde la DB
- Se llama en cada **hard load** (refresh, nueva pestaña) — no en soft navigations

**Para investigar**: JWT decoding vs validation, token introspection, session management patterns (OWASP).

### Narrow Interface (Interface Segregation)

Del cuarto principio SOLID — **Interface Segregation Principle (ISP)**:

> Una función debería recibir solo lo que necesita, ni más ni menos.

**Ejemplo concreto** — `setAuthCookies()`:

```typescript
// ❌ Interfaz ancha: recibe todo AuthResponse, pero solo necesita 3 campos
function setAuthCookies(response: AuthResponse) { ... }

// ✅ Interfaz angosta: recibe exactamente lo que necesita
type SetCookieParams = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
function setAuthCookies(params: SetCookieParams) { ... }
```

**¿Por qué importa?** Porque cuando el session route necesita setear cookies nuevas después de un refresh, no tiene un `user` disponible todavía. Con la interfaz angosta no tiene que inventar datos que no tiene.

**Para investigar**: ISP (Interface Segregation Principle), SOLID principles, skinny interfaces, dependency inversion.

### 201 Created vs 200 OK

| Código | Cuándo usarlo |
|--------|--------------|
| **200 OK** | La request se procesó correctamente |
| **201 Created** | Se CREÓ un recurso nuevo (POST de registro, creación de entidad) |
| **204 No Content** | Se procesó pero no hay contenido para devolver (DELETE) |

En nuestro register route, devolver 200 estaría mal semánticamente — la registración **crea** un usuario, debería responder 201. Next.js `NextResponse.json()` por defecto devuelve 200, hay que pasar `{ status: 201 }` explícitamente.

**Para investigar**: HTTP status codes semántica, RESTful API design, resource creation patterns.

### SDD Verification

La verificación en SDD no es testing. Es **comparar el código contra las especificaciones** y reportar discrepancias:

```
Verify:     "¿Está el botón de logout?"        ← revisión de código
Test:       "¿El botón de logout funciona?"     ← ejecución real
```

Niveles de severidad:
- **CRITICAL**: algo obligatorio que falta — debe arreglarse antes de archivar
- **WARNING**: algo que no cumple exactamente la spec pero no rompe nada
- **SUGGESTION**: mejora opcional

En la industria, esto existe como QA, code review, acceptance criteria, Definition of Done. SDD lo formaliza y automatiza para que no dependa de "acordarse".

**Para investigar**: Static analysis vs dynamic testing, QA workflows, acceptance test-driven development (ATDD), Definition of Done.

## Próximos Pasos

Para profundizar en lo que sigue:
- **Observability**: OpenTelemetry, structured logging (Loki), metrics (Prometheus), distributed tracing (Tempo)
- **Event-driven**: Event sourcing, CQRS, message brokers (RabbitMQ/Kafka), outbox pattern
- **Hexagonal Architecture**: Ports & Adapters, domain-driven design, dependency inversion
- **Auth avanzado**: OAuth2, OIDC, NextAuth.js / Auth.js, RBAC vs ABAC
- **Testing**: Jest + React Testing Library, Playwright E2E, MSW (Mock Service Worker) para mockear APIs
