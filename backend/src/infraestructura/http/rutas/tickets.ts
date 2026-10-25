
import { Router } from "express";

import {
  aTicketDTO,
  esPrioridadTicket,
  esEstadoTicket,
} from "../../../dominio/modelo/Ticket.js";

import type {
  RegistrarTicket,
  RegistroTicketDTO,
} from "../../../aplicacion/casos-uso/RegistrarTicket.js";

import type {
  ConsultarTickets,
} from "../../../aplicacion/casos-uso/ConsultarTickets.js";

import {
  TicketNoEncontrado,
} from "../../../aplicacion/casos-uso/ConsultarTickets.js";

import {
  TransicionEstadoTicketInvalida,
} from "../../../aplicacion/casos-uso/ActualizarTicket.js";

import type {
  ActualizarTicket,
  ActualizarTicketDTO,
} from "../../../aplicacion/casos-uso/ActualizarTicket.js";

import {
  AsignarTecnico,
  TecnicoNoEncontrado,
  UsuarioNoEsTecnico,
  TecnicoInactivo,
} from "../../../aplicacion/casos-uso/AsignarTecnico.js";

export interface DependenciasTickets {
  registrarTicket: RegistrarTicket;
  consultarTickets: ConsultarTickets;
  actualizarTicket: ActualizarTicket;
  asignarTecnico: AsignarTecnico;
}

// ==========================================
// VALIDACIÓN PARA REGISTRAR TICKET
// ==========================================

function validarRegistroTicket(
  cuerpo: unknown
): RegistroTicketDTO | string {
  const d = (cuerpo ?? {}) as Record<string, unknown>;

  if (
    typeof d["titulo"] !== "string" ||
    d["titulo"].trim().length < 2
  ) {
    return "El título del ticket es obligatorio";
  }

  if (
    typeof d["descripcion"] !== "string" ||
    d["descripcion"].trim().length < 2
  ) {
    return "La descripción del ticket es obligatoria";
  }

  if (
    typeof d["equipoId"] !== "number" ||
    !Number.isInteger(d["equipoId"])
  ) {
    return "El ID del equipo debe ser un número entero";
  }

  if (
    typeof d["solicitanteId"] !== "number" ||
    !Number.isInteger(d["solicitanteId"])
  ) {
    return "El ID del solicitante debe ser un número entero";
  }

  if (
    d["prioridad"] !== undefined &&
    !esPrioridadTicket(d["prioridad"])
  ) {
    return "La prioridad no es válida (BAJA, MEDIA, ALTA, CRITICA)";
  }

  if (
    d["tecnicoId"] !== undefined &&
    (
      typeof d["tecnicoId"] !== "number" ||
      !Number.isInteger(d["tecnicoId"])
    )
  ) {
    return "El ID del técnico debe ser un número entero";
  }

  return {
    titulo: d["titulo"] as string,
    descripcion: d["descripcion"] as string,
    prioridad: d["prioridad"] as RegistroTicketDTO["prioridad"],
    equipoId: d["equipoId"] as number,
    solicitanteId: d["solicitanteId"] as number,
    tecnicoId: d["tecnicoId"] as number | undefined,
  };
}

// ==========================================
// VALIDACIÓN PARA ACTUALIZAR TICKET
// ==========================================

function validarActualizarTicket(
  id: number,
  cuerpo: unknown
): ActualizarTicketDTO | string {
  const d = (cuerpo ?? {}) as Record<string, unknown>;

  if (
    typeof d["titulo"] !== "undefined" &&
    (
      typeof d["titulo"] !== "string" ||
      d["titulo"].trim().length < 2
    )
  ) {
    return "El título del ticket no es válido";
  }

  if (
    typeof d["descripcion"] !== "undefined" &&
    (
      typeof d["descripcion"] !== "string" ||
      d["descripcion"].trim().length < 2
    )
  ) {
    return "La descripción del ticket no es válida";
  }

  if (
    typeof d["prioridad"] !== "undefined" &&
    !esPrioridadTicket(d["prioridad"])
  ) {
    return "La prioridad no es válida (BAJA, MEDIA, ALTA, CRITICA)";
  }

  if (
    typeof d["estado"] !== "undefined" &&
    !esEstadoTicket(d["estado"])
  ) {
    return (
      "El estado no es válido " +
      "(ABIERTO, ASIGNADO, EN_DIAGNOSTICO, " +
      "EN_MANTENIMIENTO, RESUELTO, CERRADO, CANCELADO)"
    );
  }

  if (
    typeof d["equipoId"] !== "undefined" &&
    (
      typeof d["equipoId"] !== "number" ||
      !Number.isInteger(d["equipoId"])
    )
  ) {
    return "El ID del equipo debe ser un número entero";
  }

  if (
    typeof d["solicitanteId"] !== "undefined" &&
    (
      typeof d["solicitanteId"] !== "number" ||
      !Number.isInteger(d["solicitanteId"])
    )
  ) {
    return "El ID del solicitante debe ser un número entero";
  }

  if (
    typeof d["tecnicoId"] !== "undefined" &&
    d["tecnicoId"] !== null &&
    (
      typeof d["tecnicoId"] !== "number" ||
      !Number.isInteger(d["tecnicoId"])
    )
  ) {
    return "El ID del técnico debe ser un número entero";
  }

  if (
    typeof d["fechaCierre"] !== "undefined" &&
    d["fechaCierre"] !== null &&
    typeof d["fechaCierre"] !== "string"
  ) {
    return "La fecha de cierre debe ser un texto";
  }

  let fechaCierre: Date | null | undefined;

  if (typeof d["fechaCierre"] === "string") {
    const fecha = new Date(d["fechaCierre"]);

    if (Number.isNaN(fecha.getTime())) {
      return "La fecha de cierre no es válida";
    }

    fechaCierre = fecha;
  } else if (d["fechaCierre"] === null) {
    fechaCierre = null;
  }

  return {
    id,
    titulo: typeof d["titulo"] === "string" ? d["titulo"] : undefined,
    descripcion:
      typeof d["descripcion"] === "string"
        ? d["descripcion"]
        : undefined,
    prioridad: esPrioridadTicket(d["prioridad"])
      ? d["prioridad"]
      : undefined,
    estado: esEstadoTicket(d["estado"])
      ? d["estado"]
      : undefined,
    equipoId: typeof d["equipoId"] === "number"
      ? d["equipoId"]
      : undefined,
    solicitanteId: typeof d["solicitanteId"] === "number"
      ? d["solicitanteId"]
      : undefined,
    tecnicoId:
      d["tecnicoId"] === null
        ? null
        : typeof d["tecnicoId"] === "number"
          ? d["tecnicoId"]
          : undefined,
    fechaCierre,
  };
}

// ==========================================
// RUTAS
// ==========================================

export function rutasTickets(
  deps: DependenciasTickets
): Router {
  const rutas = Router();

  // POST /api/tickets
  // Registrar un nuevo ticket

  rutas.post("/", async (req, res, next) => {
    const validacion = validarRegistroTicket(req.body);

    if (typeof validacion === "string") {
      return void res.status(400).json({
        error: validacion,
      });
    }

    try {
      const ticket = await deps.registrarTicket.ejecutar(validacion);

      res.status(201).json(aTicketDTO(ticket));
    } catch (error) {
      next(error);
    }
  });

  // GET /api/tickets
  // Listar todos los tickets

  rutas.get("/", async (_req, res, next) => {
    try {
      const tickets = await deps.consultarTickets.listarTodos();

      res.json(tickets.map(aTicketDTO));
    } catch (error) {
      next(error);
    }
  });

  // ========================================
  // PUT /api/tickets/:id/asignar-tecnico
  // Asignar un técnico responsable
  // ========================================

  rutas.put("/:id/asignar-tecnico", async (req, res, next) => {
    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return void res.status(400).json({
        error: "El ID del ticket debe ser un número entero positivo",
      });
    }

    const cuerpo = (req.body ?? {}) as Record<string, unknown>;
    const tecnicoId = cuerpo["tecnicoId"];

    if (
      typeof tecnicoId !== "number" ||
      !Number.isInteger(tecnicoId) ||
      tecnicoId <= 0
    ) {
      return void res.status(400).json({
        error: "El ID del técnico debe ser un número entero positivo",
      });
    }

    try {
      const ticket = await deps.asignarTecnico.ejecutar({
        ticketId,
        tecnicoId,
      });

      return void res.status(200).json(aTicketDTO(ticket));
    } catch (error) {
      if (error instanceof TicketNoEncontrado) {
        return void res.status(404).json({
          error: error.message,
          codigo: "TICKET_NO_ENCONTRADO",
        });
      }

      if (error instanceof TecnicoNoEncontrado) {
        return void res.status(404).json({
          error: error.message,
          codigo: "TECNICO_NO_ENCONTRADO",
        });
      }

      if (error instanceof UsuarioNoEsTecnico) {
        return void res.status(400).json({
          error: error.message,
          codigo: "USUARIO_NO_ES_TECNICO",
        });
      }

      if (error instanceof TecnicoInactivo) {
        return void res.status(400).json({
          error: error.message,
          codigo: "TECNICO_INACTIVO",
        });
      }

      return next(error);
    }
  });

  // ========================================
  // GET /api/tickets/:id
  // Consultar ticket por ID
  // ========================================

  rutas.get("/:id", async (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return void res.status(400).json({
        error: "El ID del ticket debe ser un número entero positivo",
      });
    }

    try {
      const ticket = await deps.consultarTickets.porId(id);

      res.json(aTicketDTO(ticket));
    } catch (error) {
      if (error instanceof TicketNoEncontrado) {
        return void res.status(404).json({
          error: error.message,
        });
      }

      next(error);
    }
  });

  // ========================================
  // PUT /api/tickets/:id
  // Actualizar ticket
  // ========================================

  rutas.put("/:id", async (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return void res.status(400).json({
        error: "El ID del ticket debe ser un número entero positivo",
      });
    }

    const validacion = validarActualizarTicket(id, req.body);

    if (typeof validacion === "string") {
      return void res.status(400).json({
        error: validacion,
      });
    }

    try {
      const ticket = await deps.actualizarTicket.ejecutar(validacion);

      res.json(aTicketDTO(ticket));
    } catch (error) {
      if (error instanceof TicketNoEncontrado) {
        return void res.status(404).json({
          error: error.message,
        });
      }

      // Rechazar transiciones de estado no permitidas.
      if (error instanceof TransicionEstadoTicketInvalida) {
        return void res.status(400).json({
          error: error.message,
          codigo: "TRANSICION_ESTADO_INVALIDA",
          estadoActual: error.estadoActual,
          estadoSolicitado: error.estadoSolicitado,
        });
      }

      next(error);
    }
  });

  return rutas;
}
