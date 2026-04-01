# Take Home QA Exercise 

DummyJSON API

Bienvenido/a al ejercicio técnico de automatización de QA.  
Tenés **72 horas** desde que recibiste este link para completarlo.

---

## Contexto

[DummyJSON](https://dummyjson.com) es una API REST pública que provee datos ficticios para testing. No requiere registro ni configuración. Podés llamarla directamente desde los tests.

La API expone endpoints para:
- **Auth**: login, obtención del usuario autenticado, refresh de token
- **Usuarios**: listar, buscar, obtener uno, crear, actualizar y eliminar
- **Productos, Posts, Todos** y otros recursos que podés explorar libremente

Documentación disponible en: **https://dummyjson.com/docs**

Credenciales de prueba disponibles en: **https://dummyjson.com/users** (cualquier usuario de la lista)

> **Nota sobre escrituras:** DummyJSON simula las operaciones de escritura (POST, PUT, DELETE). Los datos no persisten realmente en el servidor, pero los status codes y las respuestas son correctos para fines de testing.

---

## Stack

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18+ |
| TypeScript | 5+ |
| Playwright | 1.44+ |

---

## Setup

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd qa-takehome

# 2. Instalar dependencias
npm install

# 3. Instalar browsers de Playwright
npx playwright install --with-deps chromium

# 4. Correr los tests de ejemplo para verificar que todo funciona
npm run test:api

# 5. Ver el reporte HTML
npm run test:report
```

---

## Estructura del repositorio

```
qa-takehome/
├── fixtures/
│   └── test-data.ts             # Datos de prueba reutilizables
├── tests/
│   ├── api/                     # Tests de API (requerido)
│   │   ├── users-list.spec.ts   ← ejemplo básico
│   │   ├── users-crud.spec.ts   ← ejemplo más completo con flujo encadenado
│   │   └── auth.spec.ts         ← ejemplo de autenticación
│   ├── ui/                      # Tests de UI (opcional)
│   │   └── dummyjson-ui.spec.ts ← placeholder
│   └── helpers/
│       └── reqres-client.ts     # Cliente tipado para DummyJSON
├── types/
│   └── api.ts                   # Tipos TypeScript de la API
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

Los archivos de ejemplo ya están escritos y pueden correrse. **Tu tarea es agregar los tuyos**
No modifiques los ejemplos existentes.

---

## Consignas

### Ejercicio 1

Agregar tests para **al menos 3 endpoints** distintos de la API DummyJSON. Los tests deben:

- [ ] Verificar el status code de respuesta
- [ ] Verificar al menos un campo del body de respuesta
- [ ] Incluir al menos un caso de error (ej: usuario inexistente → 404)
- [ ] Correr sin errores con `npm run test:api`
- [ ] Tener nombres de test descriptivos (se entiende qué testean sin leer el código)

**Entregable**: link al repositorio con los tests agregados y un README actualizado con instrucciones de cómo correrlos.

---

### Ejercicio 2

Todo lo de ejercicio, más:

- [ ] Cubrir el **ciclo CRUD completo** de usuarios (crear → leer → actualizar → eliminar)
- [ ] Agregar al menos un **test de flujo encadenado** (donde el output de un paso alimenta el siguiente)
- [ ] Incluir al menos un **test de autenticación** usando `/auth/login` y `/auth/me`
- [ ] Separar datos de test del código de test (usar fixtures o un archivo dedicado)
- [ ] Agregar **al menos 1 test de UI** sobre https://dummyjson.com (smoke o funcional)
- [ ] Documentar en el README: decisiones tomadas, qué se eligió testear y por qué

**Entregable**: repositorio con tests, README actualizado y CI corriendo (GitHub Actions verde).

---

### Ejercicio 3

Todo lo de ejercicio 2, más:

- [ ] Diseñar una **estrategia de testing** documentada: qué se cubre, qué se deja fuera y por qué
- [ ] Implementar **manejo explícito de casos borde**: campos vacíos, tipos incorrectos, respuestas inesperadas
- [ ] Incluir al menos un **test de flujo autenticado** end-to-end: login → obtener token → usar token en endpoint protegido
- [ ] Asegurarse de que los tests sean **deterministas y sin dependencias entre sí** (el orden de ejecución no importa)
- [ ] Proponer y documentar al menos **2 mejoras al repositorio base** que implementarías en un proyecto real (crear`NOTAS.md` o en el README)
- [ ] Opcional: agregar un **linter** (ESLint) o reporte de endpoints cubiertos

**Entregable**: repositorio completo, CI verde, README con estrategia documentada.

---

## Qué NO se espera

- Cobertura del 100% de endpoints
- Tests perfectos sin ningún comentario TODO
- Una arquitectura de framework compleja
- Reinventar lo que ya existe en el repo

Se valora el **criterio**: elegir bien qué testear, nombrar bien los tests, se valora agregar test steps y dejar el código en un estado en que otro ingeniero pueda entenderlo y extenderlo.

---

## Criterios de evaluación (visibles para vos)

| Área | Qué se mira |
|---|---|
| **Estructura** | El repo está organizado, los archivos están donde se esperaría encontrarlos |
| **Calidad de tests** | Los tests son legibles, los nombres son descriptivos, no hay código duplicado innecesario. Se valora que los flujos encadenados tengan pasos comentados (`// 1. Login`, `// 2. Usar token`, etc.) |
| **Criterio de testing** | Se eligieron casos relevantes, no solo los más fáciles |
| **Manejo de errores** | Se testean respuestas de error, no solo happy paths |
| **Documentación** | El README explica qué hiciste y cómo correrlo |
| **TypeScript** | Se usan tipos correctamente, sin `any` innecesarios |

---

## Preguntas frecuentes

**¿Puedo agregar dependencias?**  
Sí, siempre que estén justificadas. Explicá en el README por qué las agregaste.

**¿Tengo que testear todos los endpoints?**  
No. El criterio de selección es parte de lo evaluado.

**¿Puedo cambiar la estructura de carpetas?**  
Sí, pero justificá los cambios en el README.

**¿Tengo que hacer los tests de UI?**  
Son obligatorios.

**¿Las escrituras realmente persisten en DummyJSON?**  
No, DummyJSON simula las respuestas de escritura sin persistir datos. Está documentado en la API y es esperado para este ejercicio.

---

## Entrega

Compartí el **link a tu repositorio** (puede ser público o privado, en ese caso invitá a `<cibeles.smith@promtior.ai>`).

Asegurate de que:
- Los tests corran con `npm install && npm run test:api`
- El README refleje el estado final de tu trabajo
- No haya credenciales ni datos sensibles en el repo

Mucho éxito!
