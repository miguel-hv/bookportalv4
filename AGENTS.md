# Project Conventions — bookportalv4

## Testing & infrastructure code (error handling, filters, middleware, auth)

Cualquier componente de infraestructura (handlers de excepciones, filtros, interceptors, middleware, auth) DEBE probarse como COMPORTAMIENTO OBSERVABLE, no como existencia:

1. **Tests de integración primero (RED → GREEN)**: escribir los tests vía HTTP real (TestRestTemplate/MockMvc) ANTES de implementar. El test rojo es la señal de que el trigger falta.
2. **Cada `@ExceptionHandler` / filtro / middleware debe tener su disparador real por HTTP**: si la excepción no se puede lanzar desde un request, el handler es código muerto — se descubre en review, no en producción.
3. **Nada de "infraestructura sin trigger"**: la dependency y los handlers se agregan SOLO junto con el `@Valid`/anotación/trigger que los activa.
4. **Unit tests directos del handler son complemento, NUNCA reemplazo** de la prueba de integración.
5. Los tests de integración definen el contrato: request inválido → status + errorCode + mensaje.

## Salvaguardas pendientes (backlog)

- [ ] Jacoco con threshold en backend (romper build si cobertura del paquete exception/security < 90%)
- [ ] GitHub Actions CI: mvn test + jacoco + jest + tsc en cada push
- [ ] Evaluar mutation testing (PIT) para el paquete exception

## Backend

- Java 21 + Spring Boot + Maven. Tests con JUnit 5 + AssertJ + TestRestTemplate (integración) o Mockito (unit).
- Los DTOs de request llevan Bean Validation (`@NotBlank`/`@Pattern`/`@Size`) + `@Valid` en el controller. Los mensajes de validación se mantienen consistentes con la validación manual del servicio (defensa en profundidad).
- `mvn test` debe pasar completo antes de decir "listo".

## Frontend

- Next.js + TypeScript + Tailwind. Tests con Jest + Testing Library.
- `npx tsc --noEmit` limpio + `npx jest` completo antes de decir "listo".
- Todo fetch pasa por `src/lib/api-client.ts` (ApiError con status/errorCode/path). FormData NO se serializa con JSON.stringify.

## Kanban

- Una tarea a la vez en `doing/`. Al terminar de implementar → `reworking/` con `todo_rework` actualizado. Review → `archive/done/` o `archive/discarded/`.
