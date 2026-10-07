# Backlog de Actividades — Mantenimiento de Equipos

**Herramienta de panel virtual:** Trello  
**Repositorio GitHub:** [github.com/andrew2376/mantenimiento_equipos](https://github.com/andrew2376/mantenimiento_equipos)  
**Integrantes:**
- Antonia Gallego Marín
- Andrew Barbosa Morales
- Yulian Otero

---

## Convenciones de Trabajo

- **Nomenclatura de Ramas:** `feature/ACT-###-descripcion` (ej. `feature/ACT-016-middleware-jwt`)
- **Mensajes de Commit:** `ACT-###: descripción del cambio` (ej. `ACT-016: middleware de autenticación jwt`)
- **Estados:** `Por hacer` ➔ `En desarrollo` ➔ `En revisión` ➔ `Terminado`
- **Flujo de Integración:** Cada actividad se desarrolla en su rama `feature/` y se integra a `develop` mediante Pull Request.

---

## Lista de Actividades (Detalle por Épicas)

### E1 • Arquitectura y Configuración Base
- [x] **ACT-001** Configurar arquitectura hexagonal y TypeScript en backend (4h) • *Andrew B.* • `feature/ACT-001-arquitectura-backend`
- [x] **ACT-002** Diseñar esquema de base de datos y migraciones Prisma (3h) • *Andrew B.* • `feature/ACT-002-schema-prisma`

### E2 • Autenticación, Usuarios y Seguridad
- [x] **ACT-003** Backend: Endpoint de inicio de sesión y generación de JWT (3h) • *Antonia G.* • `feature/ACT-003-login-jwt-api`
- [x] **ACT-004** Frontend: Pantalla de login y consumo del servicio auth (4h) • *Antonia G.* • `feature/ACT-004-login-ui`
- [x] **ACT-005** Backend: Endpoints para registro y listado de usuarios (3h) • *Yulian O.* • `feature/ACT-005-usuarios-api`
- [x] **ACT-006** Frontend: Vista de listado y modal de usuarios (4h) • *Yulian O.* • `feature/ACT-006-usuarios-ui`
- [ ] **ACT-014** Backend: Exponer ruta PUT/PATCH para actualizar usuario y rol • *Yulian O.* • `feature/ACT-014-actualizar-usuario-api`
- [ ] **ACT-015** Frontend: Modal de edición de usuarios y selector de rol • *Yulian O.* • `feature/ACT-015-editar-usuario-ui`
- [ ] **ACT-016** Backend: Middleware de verificación JWT para rutas protegidas • *Antonia G.* • `feature/ACT-016-middleware-jwt`
- [ ] **ACT-017** Frontend: Implementar AuthGuard para proteger rutas en Angular • *Antonia G.* • `feature/ACT-017-authguard-angular`
- [ ] **ACT-018** Backend: Middleware de autorización según rol (RBAC) • *Andrew B.* • `feature/ACT-018-autorizacion-roles`
- [ ] **ACT-019** Frontend: Menú dinámico y permisos de vistas según rol • *Antonia G.* • `feature/ACT-019-menu-segun-rol`

### E3 • Gestión de Equipos de Cómputo
- [x] **ACT-007** Backend: Endpoints CRUD para gestión de equipos (4h) • *Andrew B.* • `feature/ACT-007-equipos-api`
- [x] **ACT-008** Frontend: Interfaz para listar, buscar y registrar equipos (4h) • *Antonia G.* • `feature/ACT-008-equipos-ui`
- [ ] **ACT-020** Backend: Implementar baja lógica de equipos (desactivar sin borrar) • *Andrew B.* • `feature/ACT-020-desactivar-equipo`
- [ ] **ACT-021** Frontend: Filtros avanzados de equipos por tipo y estado • *Yulian O.* • `feature/ACT-021-filtros-equipos`

### E4 • Solicitudes y Tickets de Soporte
- [x] **ACT-009** Backend: Endpoints para registro y consulta de tickets (3h) • *Yulian O.* • `feature/ACT-009-tickets-api`
- [x] **ACT-010** Frontend: Vistas y componentes para tickets (4h) • *Yulian O.* • `feature/ACT-010-tickets-ui`
- [ ] **ACT-022** Backend: Validar transiciones de estado en tickets • *Andrew B.* • `feature/ACT-022-estados-ticket`
- [ ] **ACT-023** Frontend: Asignar técnico responsable a solicitud o ticket • *Yulian O.* • `feature/ACT-023-asignar-tecnico`

### E5 • Atención Técnica, Mantenimientos y Repuestos
- [x] **ACT-011** Backend: Endpoints para registro y consulta de mantenimientos (4h) • *Andrew B.* • `feature/ACT-011-mantenimientos-api`
- [x] **ACT-012** Frontend: Formulario y tabla de mantenimientos (4h) • *Antonia G.* • `feature/ACT-012-mantenimientos-ui`
- [x] **ACT-013** Frontend: Diseño de navegación común y navbar (3h) • *Antonia G.* • `feature/ACT-013-navbar-layout`
- [ ] **ACT-024** Backend: Registro de diagnóstico detallado del equipo • *Andrew B.* • `feature/ACT-024-diagnostico-mantenimiento`
- [x] **ACT-025** Backend: Modelo Prisma y DAO para repuestos utilizados (4h) • *Antonia G.* • `feature/ACT-025-repuestos-prisma`
- [x] **ACT-026** Frontend: Formulario para asociar repuestos al mantenimiento (4h) • *Antonia G.* • `feature/ACT-026-repuestos-ui`
- [ ] **ACT-027** Backend: Cierre de mantenimiento con sincronización de ticket • *Andrew B.* • `feature/ACT-027-cierre-mantenimiento`

### E6 • Trazabilidad y Calidad del Software
- [ ] **ACT-028** Frontend: Vista de hoja de vida e historial por equipo • *Yulian O.* • `feature/ACT-028-hoja-vida-equipo`
- [ ] **ACT-029** Pruebas: Pruebas unitarias de casos de uso con Vitest • *Andrew B.* • `feature/ACT-029-pruebas-unitarias`
- [ ] **ACT-030** Pruebas: Validación e integración de flujo completo de mantenimiento • *Antonia G.* • `feature/ACT-030-prueba-flujo-completo`

---

## Tabla de Control de Backlog (Plantilla del Taller)

| ID | Actividad / Descripción | Responsable(s) | Estado | Rama(s) | Commit(s) | Horas |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **ACT-001** | Configurar arquitectura hexagonal y TypeScript en backend | Andrew B. | Terminado | `feature/ACT-001-arquitectura-backend` | `41e2414` | 4h |
| **ACT-002** | Diseñar esquema de base de datos y migraciones Prisma | Andrew B. | Terminado | `feature/ACT-002-schema-prisma` | `325bc7b` | 3h |
| **ACT-003** | Backend: Endpoint de inicio de sesión y generación de JWT | Antonia G. | Terminado | `feature/ACT-003-login-jwt-api` | `de48522` | 3h |
| **ACT-004** | Frontend: Pantalla de inicio de sesión y consumo de auth | Antonia G. | Terminado | `feature/ACT-004-login-ui` | `de48522` | 4h |
| **ACT-005** | Backend: Endpoints para registro y listado de usuarios | Yulian O. | Terminado | `feature/ACT-005-usuarios-api` | `aa08b85` | 3h |
| **ACT-006** | Frontend: Vista de listado y modal de creación de usuarios | Yulian O. | Terminado | `feature/ACT-006-usuarios-ui` | `aa08b85` | 4h |
| **ACT-007** | Backend: Endpoints CRUD para gestión de equipos | Andrew B. | Terminado | `feature/ACT-007-equipos-api` | `0d572e5` | 4h |
| **ACT-008** | Frontend: Interfaz para listar, buscar y registrar equipos | Antonia G. | Terminado | `feature/ACT-008-equipos-ui` | `747543c` | 4h |
| **ACT-009** | Backend: Endpoints para registro y consulta de tickets | Yulian O. | Terminado | `feature/ACT-009-tickets-api` | `e66e1da` | 3h |
| **ACT-010** | Frontend: Vistas y componentes para el módulo de tickets | Yulian O. | Terminado | `feature/ACT-010-tickets-ui` | `e66e1da` | 4h |
| **ACT-011** | Backend: Endpoints para registro y consulta de mantenimientos | Andrew B. | Terminado | `feature/ACT-011-mantenimientos-api` | `5a1bcb9` | 4h |
| **ACT-012** | Frontend: Formulario y tabla para registro de mantenimientos | Antonia G. | Terminado | `feature/ACT-012-mantenimientos-ui` | `5a1bcb9` | 4h |
| **ACT-013** | Frontend: Diseño de navegación común y navbar | Antonia G. | Terminado | `feature/ACT-013-navbar-layout` | `731559d` | 3h |
| **ACT-014** | Backend: Exponer ruta PUT/PATCH para actualizar usuario y rol | Yulian O. | Por hacer | `feature/ACT-014-actualizar-usuario-api` | - | - |
| **ACT-015** | Frontend: Habilitar modal de edición de usuarios y selector de rol | Yulian O. | Por hacer | `feature/ACT-015-editar-usuario-ui` | - | - |
| **ACT-016** | Backend: Middleware de verificación JWT para rutas protegidas | Antonia G. | En desarrollo | `feature/ACT-016-middleware-jwt` | - | - |
| **ACT-017** | Frontend: Implementar AuthGuard para proteger rutas en Angular | Antonia G. | Por hacer | `feature/ACT-017-authguard-angular` | - | - |
| **ACT-018** | Backend: Middleware de autorización según rol (RBAC) | Andrew B. | Por hacer | `feature/ACT-018-autorizacion-roles` | - | - |
| **ACT-019** | Frontend: Ocultar o mostrar opciones del menú según rol | Antonia G. | Por hacer | `feature/ACT-019-menu-segun-rol` | - | - |
| **ACT-020** | Backend: Implementar baja lógica de equipos (desactivar) | Andrew B. | Por hacer | `feature/ACT-020-desactivar-equipo` | - | - |
| **ACT-021** | Frontend: Filtros avanzados de equipos por tipo y estado | Yulian O. | Por hacer | `feature/ACT-021-filtros-equipos` | - | - |
| **ACT-022** | Backend: Validar transiciones de estado en tickets | Andrew B. | Por hacer | `feature/ACT-022-estados-ticket` | - | - |
| **ACT-023** | Frontend: Vista para asignar técnico responsable | Yulian O. | Por hacer | `feature/ACT-023-asignar-tecnico` | - | - |
| **ACT-024** | Backend: Registro y actualización de diagnóstico detallado | Andrew B. | Por hacer | `feature/ACT-024-diagnostico-mantenimiento` | - | - |
| **ACT-025** | Backend: Modelo Prisma y DAO para repuestos utilizados | Antonia G. | Terminado | `feature/ACT-025-repuestos-prisma` | `a8b0f5a` | 4h |
| **ACT-026** | Frontend: Formulario para asociar repuestos al mantenimiento | Antonia G. | Terminado | `feature/ACT-026-repuestos-ui` | `42fd853` | 4h |
| **ACT-027** | Backend: Cierre de mantenimiento con sincronización de ticket | Andrew B. | Por hacer | `feature/ACT-027-cierre-mantenimiento` | - | - |
| **ACT-028** | Frontend: Vista de historial de mantenimientos por equipo | Yulian O. | Por hacer | `feature/ACT-028-hoja-vida-equipo` | - | - |
| **ACT-029** | Pruebas: Pruebas unitarias de casos de uso con Vitest | Andrew B. | Por hacer | `feature/ACT-029-pruebas-unitarias` | - | - |
| **ACT-030** | Pruebas: Validación e integración de flujo completo | Antonia G. | Por hacer | `feature/ACT-030-prueba-flujo-completo` | - | - |
