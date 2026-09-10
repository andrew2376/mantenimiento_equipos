import express, { Router } from 'express'

import type {
  ErrorRequestHandler,
  Express
} from 'express'

import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

import {
  rutasEquipos,
  type DependenciasEquipos
} from './rutas/equipos'

import {
  rutasMantenimientos,
  type DependenciasMantenimientos
} from './rutas/mantenimientos'

import {
  rutasUsuarios,
  type DependenciasUsuarios
} from './rutas/usuarios'

export interface DependenciasServidor {
  equipos: DependenciasEquipos
  mantenimientos: DependenciasMantenimientos
  usuarios: DependenciasUsuarios
}

const swaggerDocument = {
  openapi: '3.0.0',

  info: {
    title:
      'API - Sistema de Gestión y Trazabilidad de Mantenimiento de Equipos',
    version: '1.0.0',
    description:
      'API REST para la gestión de equipos de cómputo y sus mantenimientos.'
  },

  servers: [
    {
      url: 'http://localhost:3000'
    }
  ],

  tags: [
    {
      name: 'Equipos',
      description:
        'Gestión de los equipos de cómputo registrados en el sistema.'
    },
    {
      name: 'Mantenimientos',
      description:
        'Gestión de los mantenimientos realizados a los equipos.'
    }
  ],

  paths: {
    '/api/equipos': {
      get: {
        tags: ['Equipos'],
        summary: 'Obtener todos los equipos',
        responses: {
          '200': {
            description: 'Lista de equipos'
          }
        }
      },

      post: {
        tags: ['Equipos'],
        summary: 'Registrar un equipo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'codigoInventario',
                  'nombre',
                  'tipo',
                  'marca',
                  'ubicacion'
                ],
                properties: {
                  codigoInventario: {
                    type: 'string',
                    example: 'EQ-001'
                  },
                  nombre: {
                    type: 'string',
                    example: 'Computador de escritorio'
                  },
                  tipo: {
                    type: 'string',
                    example: 'PORTATIL'
                  },
                  marca: {
                    type: 'string',
                    example: 'Dell'
                  },
                  modelo: {
                    type: 'string',
                    example: 'OptiPlex 7090'
                  },
                  numeroSerie: {
                    type: 'string',
                    example: 'SN-001-2026'
                  },
                  ubicacion: {
                    type: 'string',
                    example: 'Laboratorio 1'
                  },
                  estado: {
                    type: 'integer',
                    example: 1
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Equipo registrado correctamente'
          },
          '400': {
            description: 'Datos inválidos'
          }
        }
      }
    },

    '/api/equipos/{id}': {
      get: {
        tags: ['Equipos'],
        summary: 'Obtener un equipo por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            example: 1
          }
        ],
        responses: {
          '200': {
            description: 'Equipo encontrado'
          },
          '404': {
            description: 'Equipo no encontrado'
          }
        }
      },

      put: {
        tags: ['Equipos'],
        summary: 'Actualizar un equipo',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  codigoInventario: {
                    type: 'string',
                    example: 'EQ-001'
                  },
                  nombre: {
                    type: 'string',
                    example: 'Computador de escritorio'
                  },
                  tipo: {
                    type: 'string',
                    example: 'PORTATIL'
                  },
                  marca: {
                    type: 'string',
                    example: 'Dell'
                  },
                  modelo: {
                    type: 'string',
                    example: 'OptiPlex 7090'
                  },
                  numeroSerie: {
                    type: 'string',
                    example: 'SN-001-2026'
                  },
                  ubicacion: {
                    type: 'string',
                    example: 'Laboratorio 1'
                  },
                  estado: {
                    type: 'integer',
                    example: 1
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Equipo actualizado correctamente'
          },
          '404': {
            description: 'Equipo no encontrado'
          }
        }
      }
    },

    '/api/equipos/serial/{serial}': {
      get: {
        tags: ['Equipos'],
        summary: 'Obtener un equipo por número de serie',
        parameters: [
          {
            name: 'serial',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            example: 'SN-001-2026'
          }
        ],
        responses: {
          '200': {
            description: 'Equipo encontrado'
          },
          '404': {
            description: 'Equipo no encontrado'
          }
        }
      }
    },

    '/api/mantenimientos': {
      get: {
        tags: ['Mantenimientos'],
        summary: 'Obtener todos los mantenimientos',
        responses: {
          '200': {
            description: 'Lista de mantenimientos'
          }
        }
      },

      post: {
        tags: ['Mantenimientos'],
        summary: 'Registrar un mantenimiento',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'descripcion',
                  'equipoId'
                ],
                properties: {
                  descripcion: {
                    type: 'string',
                    example: 'Limpieza interna y mantenimiento preventivo'
                  },
                  tipo: {
                    type: 'string',
                    example: 'CORRECTIVO'
                  },
                  estado: {
                    type: 'string',
                    example: 'PENDIENTE'
                  },
                  diagnostico: {
                    type: 'string',
                    example: 'Acumulación de polvo en el equipo'
                  },
                  tecnico: {
                    type: 'string',
                    example: 'Técnico de soporte'
                  },
                  equipoId: {
                    type: 'integer',
                    example: 1
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Mantenimiento registrado correctamente'
          },
          '400': {
            description: 'Datos inválidos'
          }
        }
      }
    },

    '/api/mantenimientos/{id}': {
      get: {
        tags: ['Mantenimientos'],
        summary: 'Obtener un mantenimiento por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            example: 1
          }
        ],
        responses: {
          '200': {
            description: 'Mantenimiento encontrado'
          },
          '404': {
            description: 'Mantenimiento no encontrado'
          }
        }
      },

      put: {
        tags: ['Mantenimientos'],
        summary: 'Actualizar estado de un mantenimiento',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  estado: {
                    type: 'string',
                    example: 'FINALIZADO'
                  },
                  diagnostico: {
                    type: 'string',
                    example: 'Se realizó limpieza y cambio de pasta térmica'
                  },
                  tecnico: {
                    type: 'string',
                    example: 'Técnico de soporte'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Mantenimiento actualizado correctamente'
          },
          '404': {
            description: 'Mantenimiento no encontrado'
          }
        }
      }
    },

    '/api/mantenimientos/equipo/{equipoId}': {
      get: {
        tags: ['Mantenimientos'],
        summary: 'Obtener mantenimientos de un equipo',
        parameters: [
          {
            name: 'equipoId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            example: 1
          }
        ],
        responses: {
          '200': {
            description:
              'Lista de mantenimientos asociados al equipo'
          },
          '404': {
            description: 'Equipo no encontrado'
          }
        }
      }
    }
  }
}

const manejadorErrores: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  console.error(
    '[Error no controlado]',
    error
  )

  res.status(500).json({
    error: 'Error interno del servidor'
  })
}

export function crearServidor(
  deps: DependenciasServidor
): Express {
  const app = express()

  app.use(cors())

  app.use(express.json())

  const api = Router()

  api.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  )

  api.use(
    '/equipos',
    rutasEquipos(
      deps.equipos
    )
  )

  api.use(
    '/mantenimientos',
    rutasMantenimientos(
      deps.mantenimientos
    )
  )
  api.use(
  '/usuarios',
  rutasUsuarios(
    deps.usuarios
  )
)

  app.use(
    '/api',
    api
  )

  app.use(
    (_req, res) => {
      res.status(404).json({
        error: 'Ruta no encontrada'
      })
    }
  )

  app.use(
    manejadorErrores
  )

  return app
} 