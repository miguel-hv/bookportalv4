# Salvaguardas automáticas de calidad

Proteger contra código muerto en infraestructura (error handling, filtros, middleware, auth).
Ver convención completa en AGENTS.md → "Testing & infrastructure code".

## Pasos

- [ ] Jacoco con threshold en backend: romper build si cobertura del paquete `exception` + `security` < 90%
- [ ] GitHub Actions CI: `mvn test` + jacoco + `jest` + `tsc --noEmit` en cada push
- [ ] Evaluar mutation testing (PIT) para el paquete exception
