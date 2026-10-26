
import express, { Router } from "express";
import type { ErrorRequestHandler, Express } from "express";

import cors from "cors";
import swaggerUi from "swagger-ui-express";

import {
  rutasEquipos,
  type DependenciasEquipos,
} from "./rutas/equipos";

import {
  rutasMantenimientos,
  type DependenciasMantenimientos,
} from "./rutas/mantenimientos";

import {
  rutasUsuarios,
  type DependenciasUsuarios,
} from "./rutas/usuarios";

import {
  rutasTickets,
  type DependenciasTickets,
} from "./rutas/tickets";

import {
  rutasRepuestos,
  type DependenciasRepuestos,
} from "./rutas/repuestos";

import { verificarJWT } from "./middleware/verificarJWT";
import { autorizarRol } from "./middleware/autorizarRol";

export interface DependenciasServidor {
  equipos: DependenciasEquipos;
  mantenimientos: DependenciasMantenimientos;
  usuarios: DependenciasUsuarios;
  tickets: DependenciasTickets;
  repuestos: DependenciasRepuestos;
}

const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title:
      "API - Sistema de Gestión y Trazabilidad de Mantenimiento de Equipos",
    version: "1.0.0",
    description:
      "API REST para la gestión de equipos de cómputo y sus mantenimientos.\n\n**Cómo probar la autenticación desde aquí**:\n1. Inicia sesión en `POST /api/usuarios/login` (o registra uno en `POST /api/usuarios`).\n2. Copia el `token` devuelto en la respuesta.\n3. Haz clic en el botón verde **Authorize 🔓** (arriba a la derecha), pega el token y pulsa **Authorize**.\n4. A partir de ese momento, todas las peticiones enviarán automáticamente el encabezado `Authorization: Bearer <token>`.",
  },

  servers: [
    {
      url: "http://localhost:3000",
    },
  ],

  security: [
    {
      bearerAuth: [],
    },
  ],

  tags: [
    {
      name: "Autenticación",
      description:
        "Inicio de sesión, registro y gestión de usuarios del sistema.",
    },
    {
      name: "Equipos",
      description:
        "Gestión de los equipos de cómputo registrados en el sistema.",
    },
    {
      name: "Mantenimientos",
      description: "Gestión de los mantenimientos realizados a los equipos.",
    },

    {
      name: "Tickets",
      description:
        "Gestión de tickets de soporte, asignación de técnicos y actualización de estados.",
    },
    {
      name: "Repuestos",
      description:
        "Gestión de repuestos y asociación con mantenimientos (control de stock e inventario).",
    },
  ],

  paths: {
    "/api/equipos": {
      get: {
        tags: ["Equipos"],
        summary: "Obtener todos los equipos",
        responses: {
          "200": {
            description: "Lista de equipos",
          },
        },
      },

      post: {
        tags: ["Equipos"],
        summary: "Registrar un equipo",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "codigoInventario",
                  "nombre",
                  "tipo",
                  "marca",
                  "ubicacion",
                ],
                properties: {
                  codigoInventario: {
                    type: "string",
                    example: "EQ-001",
                  },
                  nombre: {
                    type: "string",
                    example: "Computador de escritorio",
                  },
                  tipo: {
                    type: "string",
                    example: "PORTATIL",
                  },
                  marca: {
                    type: "string",
                    example: "Dell",
                  },
                  modelo: {
                    type: "string",
                    example: "OptiPlex 7090",
                  },
                  numeroSerie: {
                    type: "string",
                    example: "SN-001-2026",
                  },
                  ubicacion: {
                    type: "string",
                    example: "Laboratorio 1",
                  },
                  estado: {
                    type: "integer",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Equipo registrado correctamente",
          },
          "400": {
            description: "Datos inválidos",
          },
        },
      },
    },

    "/api/equipos/{id}": {
      get: {
        tags: ["Equipos"],
        summary: "Obtener un equipo por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Equipo encontrado",
          },
          "404": {
            description: "Equipo no encontrado",
          },
        },
      },

      put: {
        tags: ["Equipos"],
        summary: "Actualizar un equipo",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  codigoInventario: {
                    type: "string",
                    example: "EQ-001",
                  },
                  nombre: {
                    type: "string",
                    example: "Computador de escritorio",
                  },
                  tipo: {
                    type: "string",
                    example: "PORTATIL",
                  },
                  marca: {
                    type: "string",
                    example: "Dell",
                  },
                  modelo: {
                    type: "string",
                    example: "OptiPlex 7090",
                  },
                  numeroSerie: {
                    type: "string",
                    example: "SN-001-2026",
                  },
                  ubicacion: {
                    type: "string",
                    example: "Laboratorio 1",
                  },
                  estado: {
                    type: "integer",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Equipo actualizado correctamente",
          },
          "404": {
            description: "Equipo no encontrado",
          },
        },
      },
    },

    "/api/equipos/serial/{serial}": {
      get: {
        tags: ["Equipos"],
        summary: "Obtener un equipo por número de serie",
        parameters: [
          {
            name: "serial",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            example: "SN-001-2026",
          },
        ],
        responses: {
          "200": {
            description: "Equipo encontrado",
          },
          "404": {
            description: "Equipo no encontrado",
          },
        },
      },
    },

    "/api/mantenimientos": {
      get: {
        tags: ["Mantenimientos"],
        summary: "Obtener todos los mantenimientos",
        responses: {
          "200": {
            description: "Lista de mantenimientos",
          },
        },
      },

      post: {
        tags: ["Mantenimientos"],
        summary: "Registrar un mantenimiento",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["descripcion", "equipoId"],
                properties: {
                  descripcion: {
                    type: "string",
                    example: "Limpieza interna y mantenimiento preventivo",
                  },
                  tipo: {
                    type: "string",
                    example: "CORRECTIVO",
                  },
                  estado: {
                    type: "string",
                    example: "PENDIENTE",
                  },
                  diagnostico: {
                    type: "string",
                    example: "Acumulación de polvo en el equipo",
                  },
                  tecnico: {
                    type: "string",
                    example: "Técnico de soporte",
                  },
                  equipoId: {
                    type: "integer",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Mantenimiento registrado correctamente",
          },
          "400": {
            description: "Datos inválidos",
          },
        },
      },
    },

    "/api/mantenimientos/{id}": {
      get: {
        tags: ["Mantenimientos"],
        summary: "Obtener un mantenimiento por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Mantenimiento encontrado",
          },
          "404": {
            description: "Mantenimiento no encontrado",
          },
        },
      },

      put: {
        tags: ["Mantenimientos"],
        summary: "Actualizar estado de un mantenimiento",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  estado: {
                    type: "string",
                    example: "FINALIZADO",
                  },
                  diagnostico: {
                    type: "string",
                    example:
                      "Se realizó limpieza y cambio de pasta térmica",
                  },
                  tecnico: {
                    type: "string",
                    example: "Técnico de soporte",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Mantenimiento actualizado correctamente",
          },
          "404": {
            description: "Mantenimiento no encontrado",
          },
        },
      },
    },

    "/api/mantenimientos/{id}/diagnostico": {
      patch: {
        tags: ["Mantenimientos"],
        summary: "Registrar o actualizar diagnóstico detallado del equipo (ACT-024)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["diagnostico", "tecnico"],
                properties: {
                  diagnostico: {
                    type: "string",
                    minLength: 10,
                    example: "Falla en sectores del disco duro y memoria RAM desajustada. Se requiere reemplazo de unidad SSD.",
                  },
                  tecnico: {
                    type: "string",
                    minLength: 2,
                    example: "Carlos Técnico",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Diagnóstico registrado exitosamente. Si estaba PENDIENTE, pasa a EN_PROCESO.",
          },
          "400": {
            description: "Diagnóstico menor a 10 caracteres o técnico no especificado",
          },
          "404": {
            description: "Mantenimiento no encontrado",
          },
          "409": {
            description: "No se puede registrar diagnóstico en un mantenimiento finalizado o cancelado",
          },
        },
      },
    },

    "/api/mantenimientos/equipo/{equipoId}": {
      get: {
        tags: ["Mantenimientos"],
        summary: "Obtener mantenimientos de un equipo",
        parameters: [
          {
            name: "equipoId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Lista de mantenimientos asociados al equipo",
          },
          "404": {
            description: "Equipo no encontrado",
          },
        },
      },
    },

    "/api/tickets": {
      get: {
        tags: ["Tickets"],
        summary: "Consultar todos los tickets",
        description: "Obtiene la lista de tickets registrados en el sistema.",
        responses: {
          "200": {
            description: "Lista de tickets obtenida correctamente.",
          },
          "500": {
            description: "Error interno del servidor.",
          },
        },
      },

      post: {
        tags: ["Tickets"],
        summary: "Registrar un ticket",
        description: "Registra un nuevo ticket de soporte.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "titulo",
                  "descripcion",
                  "equipoId",
                  "solicitanteId",
                ],
                properties: {
                  titulo: {
                    type: "string",
                    example: "Equipo no enciende",
                  },
                  descripcion: {
                    type: "string",
                    example: "El computador no enciende al presionar el botón.",
                  },
                  equipoId: {
                    type: "integer",
                    example: 1,
                  },
                  solicitanteId: {
                    type: "integer",
                    example: 2,
                  },
                  prioridad: {
                    type: "string",
                    example: "ALTA",
                  },
                  tecnicoId: {
                    type: "integer",
                    example: 3,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Ticket registrado correctamente.",
          },
          "400": {
            description: "Datos inválidos o incompletos.",
          },
        },
      },
    },

    "/api/tickets/{id}": {
      get: {
        tags: ["Tickets"],
        summary: "Consultar un ticket por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Ticket encontrado.",
          },
          "400": {
            description: "El ID del ticket no es válido.",
          },
          "404": {
            description: "Ticket no encontrado.",
          },
        },
      },

      put: {
        tags: ["Tickets"],
        summary: "Actualizar un ticket",
        description: "Actualiza los datos permitidos de un ticket existente.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  titulo: {
                    type: "string",
                    example: "Equipo no enciende",
                  },
                  descripcion: {
                    type: "string",
                    example: "Se revisará la fuente de alimentación.",
                  },
                  prioridad: {
                    type: "string",
                    example: "MEDIA",
                  },
                  estado: {
                    type: "string",
                    example: "EN_PROCESO",
                  },
                  equipoId: {
                    type: "integer",
                    example: 1,
                  },
                  solicitanteId: {
                    type: "integer",
                    example: 2,
                  },
                  tecnicoId: {
                    type: "integer",
                    example: 3,
                  },
                  fechaCierre: {
                    type: "string",
                    format: "date-time",
                    example: "2026-10-25T15:30:00.000Z",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Ticket actualizado correctamente.",
          },
          "400": {
            description: "Datos inválidos o transición de estado no permitida.",
          },
          "404": {
            description: "Ticket no encontrado.",
          },
        },
      },
    },

    "/api/tickets/{id}/asignar-tecnico": {
      put: {
        tags: ["Tickets"],
        summary: "Asignar un técnico a un ticket",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tecnicoId"],
                properties: {
                  tecnicoId: {
                    type: "integer",
                    example: 3,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Técnico asignado correctamente.",
          },
          "400": {
            description: "El usuario no es técnico o el técnico está inactivo.",
          },
          "404": {
            description: "Ticket o técnico no encontrado.",
          },
        },
      },
    },

    "/api/mantenimientos/{id}/cerrar": {
      post: {
        tags: ["Mantenimientos"],
        summary: "Cierre de mantenimiento con sincronización de ticket",
        description: "Finaliza el mantenimiento, verifica el diagnóstico técnico, restablece el equipo a OPERATIVO y sincroniza el ticket asociado a estado RESUELTO con su fecha de cierre.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  diagnostico: {
                    type: "string",
                    example: "Mantenimiento preventivo completado, pruebas de rendimiento superadas",
                  },
                  tecnico: {
                    type: "string",
                    example: "Antonia Gallego",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Mantenimiento finalizado exitosamente y ticket sincronizado",
          },
          "400": {
            description: "Diagnóstico requerido o el mantenimiento ya se encuentra cerrado",
          },
          "404": {
            description: "Mantenimiento no encontrado",
          },
        },
      },
    },

    "/api/repuestos": {
      get: {
        tags: ["Repuestos"],
        summary: "Listar catálogo completo de repuestos",
        responses: {
          "200": {
            description: "Lista de repuestos registrados en el sistema",
          },
        },
      },
      post: {
        tags: ["Repuestos"],
        summary: "Registrar un nuevo repuesto en inventario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nombre", "codigo", "costoUnitario"],
                properties: {
                  nombre: {
                    type: "string",
                    example: "Memoria RAM 16GB DDR4",
                  },
                  codigo: {
                    type: "string",
                    example: "RAM-DDR4-16",
                  },
                  descripcion: {
                    type: "string",
                    example: "Módulo Kingston Fury 3200MHz",
                  },
                  costoUnitario: {
                    type: "number",
                    example: 45.5,
                  },
                  stock: {
                    type: "integer",
                    example: 10,
                  },
                  activo: {
                    type: "boolean",
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Repuesto creado exitosamente",
          },
          "400": {
            description: "Datos inválidos o faltantes",
          },
          "409": {
            description: "Ya existe un repuesto con ese código",
          },
        },
      },
    },

    "/api/repuestos/{id}": {
      get: {
        tags: ["Repuestos"],
        summary: "Consultar repuesto por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Detalle del repuesto",
          },
          "404": {
            description: "Repuesto no encontrado",
          },
        },
      },
    },

    "/api/repuestos/mantenimiento/{mantenimientoId}": {
      get: {
        tags: ["Repuestos"],
        summary: "Listar repuestos utilizados en un mantenimiento",
        parameters: [
          {
            name: "mantenimientoId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Lista de repuestos asociados al mantenimiento",
          },
        },
      },
    },

    "/api/repuestos/mantenimiento": {
      post: {
        tags: ["Repuestos"],
        summary: "Asociar repuesto a un mantenimiento (descuenta stock)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["mantenimientoId", "repuestoId", "cantidad"],
                properties: {
                  mantenimientoId: {
                    type: "integer",
                    example: 1,
                  },
                  repuestoId: {
                    type: "integer",
                    example: 1,
                  },
                  cantidad: {
                    type: "integer",
                    example: 2,
                  },
                  costoUnitario: {
                    type: "number",
                    example: 45.5,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Repuesto asociado correctamente y stock descontado",
          },
          "400": {
            description: "Stock insuficiente o datos inválidos",
          },
          "404": {
            description: "Mantenimiento o repuesto no encontrado",
          },
        },
      },
    },

    "/api/repuestos/mantenimiento/{id}": {
      delete: {
        tags: ["Repuestos"],
        summary: "Desasociar repuesto de un mantenimiento (restaura stock)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          "204": {
            description:
              "Repuesto desasociado y stock restaurado en inventario",
          },
          "404": {
            description: "Registro de repuesto de mantenimiento no encontrado",
          },
        },
      },
    },

    "/api/usuarios/login": {
      post: {
        tags: ["Autenticación"],
        summary: "Iniciar sesión en el sistema (obtener JWT)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["correo", "clave"],
                properties: {
                  correo: {
                    type: "string",
                    format: "email",
                    example: "admin@uam.edu.co",
                  },
                  clave: {
                    type: "string",
                    format: "password",
                    example: "admin123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Inicio de sesión exitoso. Retorna el token JWT.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      description:
                        "Token JWT para Authorization: Bearer <token>",
                    },
                    usuario: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        nombre: { type: "string", example: "Administrador" },
                        correo: { type: "string", example: "admin@uam.edu.co" },
                        rol: { type: "string", example: "ADMINISTRADOR" },
                        activo: { type: "boolean", example: true },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Correo y clave son obligatorios",
          },
          "401": {
            description: "Correo o clave incorrectos",
          },
        },
      },
    },

    "/api/usuarios": {
      get: {
        tags: ["Autenticación"],
        summary: "Listar todos los usuarios del sistema",
        responses: {
          "200": {
            description: "Lista de usuarios registrados",
          },
        },
      },
      post: {
        tags: ["Autenticación"],
        summary: "Registrar un nuevo usuario",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nombre", "correo", "clave", "rol"],
                properties: {
                  nombre: {
                    type: "string",
                    example: "Carlos Agente",
                  },
                  correo: {
                    type: "string",
                    format: "email",
                    example: "carlos@uam.edu.co",
                  },
                  clave: {
                    type: "string",
                    format: "password",
                    example: "clave123",
                  },
                  rol: {
                    type: "string",
                    enum: [
                      "SOLICITANTE",
                      "TECNICO",
                      "ADMINISTRADOR",
                      "SUPERVISOR",
                    ],
                    example: "TECNICO",
                  },
                  activo: {
                    type: "boolean",
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuario registrado correctamente",
          },
          "400": {
            description: "Datos faltantes o inválidos",
          },
        },
      },
    },

    "/api/usuarios/{id}": {
      get: {
        tags: ["Autenticación"],
        summary: "Consultar usuario por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Detalle del usuario",
          },
          "404": {
            description: "Usuario no encontrado",
          },
        },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token obtenido en `POST /api/usuarios/login`.",
      },
    },
  },
};

const manejadorErrores: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  console.error("[Error no controlado]", error);

  res.status(500).json({
    error: "Error interno del servidor",
  });
};

export function crearServidor(deps: DependenciasServidor): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const api = Router();

  // Swagger se conserva y queda accesible sin iniciar sesión.
  api.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Equipos: validar JWT y después comprobar el rol.
  api.use(
    "/equipos",
    verificarJWT,
    autorizarRol,
    rutasEquipos(deps.equipos),
  );

  // Mantenimientos: validar JWT y después comprobar el rol.
  api.use(
    "/mantenimientos",
    verificarJWT,
    autorizarRol,
    rutasMantenimientos(deps.mantenimientos),
  );

  // Login público; las demás rutas de usuarios requieren autenticación.
  api.use(
    "/usuarios",
    (req, res, next) => {
      if (req.method === "POST" && req.path === "/login") {
        next();
        return;
      }

      verificarJWT(req, res, (error?: unknown) => {
        if (error) {
          next(error);
          return;
        }

        autorizarRol(req, res, next);
      });
    },
    rutasUsuarios(deps.usuarios),
  );

  // Tickets: validar JWT y después comprobar el rol.
  api.use(
    "/tickets",
    verificarJWT,
    autorizarRol,
    rutasTickets(deps.tickets),
  );

  // Repuestos: validar JWT y después comprobar el rol.
  api.use(
    "/repuestos",
    verificarJWT,
    autorizarRol,
    rutasRepuestos(deps.repuestos),
  );

  app.use("/api", api);

  // Se conserva la respuesta para las rutas inexistentes.
  app.use((_req, res) => {
    res.status(404).json({
      error: "Ruta no encontrada",
    });
  });

  // Se conserva el manejador general de errores.
  app.use(manejadorErrores);

  return app;
}
