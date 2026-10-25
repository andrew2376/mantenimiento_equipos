
import type {
  Request,
  Response,
  NextFunction,
} from "express";

interface UsuarioAutenticado {
  id: number;
  correo: string;
  rol: string;
}

const ROLES = {
  SOLICITANTE: "SOLICITANTE",
  TECNICO: "TECNICO",
  ADMINISTRADOR: "ADMINISTRADOR",
  SUPERVISOR: "SUPERVISOR",
} as const;

function rutaPermitida(
  ruta: string,
  metodo: string,
  rol: string,
  usuario: UsuarioAutenticado,
  req: Request,
): boolean {
  // El administrador puede realizar todas las operaciones.
  if (rol === ROLES.ADMINISTRADOR) {
    return true;
  }

  // EQUIPOS
  if (
    ruta === "/equipos" ||
    ruta.startsWith("/equipos/")
  ) {
    // Todos los roles autenticados pueden consultar equipos.
    if (metodo === "GET") {
      return true;
    }

    // Modificar, registrar, activar o desactivar equipos:
    // únicamente el administrador.
    return false;
  }

  // USUARIOS
  if (
    ruta === "/usuarios" ||
    ruta.startsWith("/usuarios/")
  ) {
    // El inicio de sesión público se exceptúa en servidor.ts.
    // Las demás operaciones quedan reservadas al administrador.
    return false;
  }

  // TICKETS
  if (
    ruta === "/tickets" ||
    ruta.startsWith("/tickets/")
  ) {
    // El solicitante solo puede registrar un ticket a su nombre,
    // sin asignar directamente un técnico.
    if (
      rol === ROLES.SOLICITANTE &&
      metodo === "POST" &&
      ruta === "/tickets"
    ) {
      const cuerpo = req.body as {
        solicitanteId?: unknown;
        tecnicoId?: unknown;
      };

      return (
        Number(cuerpo.solicitanteId) === usuario.id &&
        (
          cuerpo.tecnicoId === undefined ||
          cuerpo.tecnicoId === null ||
          cuerpo.tecnicoId === ""
        )
      );
    }

    // Técnicos y supervisores pueden consultar y actualizar tickets.
    const rolesPermitidos: string[] = [
      ROLES.TECNICO,
      ROLES.SUPERVISOR,
    ];

    if (
      rolesPermitidos.includes(rol) &&
      (metodo === "GET" || metodo === "PUT")
    ) {
      return true;
    }

    // Técnicos y supervisores pueden registrar tickets.
    if (
      rolesPermitidos.includes(rol) &&
      metodo === "POST" &&
      ruta === "/tickets"
    ) {
      return true;
    }

    return false;
  }

  // MANTENIMIENTOS
  if (
    ruta === "/mantenimientos" ||
    ruta.startsWith("/mantenimientos/")
  ) {
    const rolesPermitidos: string[] = [
      ROLES.TECNICO,
      ROLES.SUPERVISOR,
    ];

    return (
      rolesPermitidos.includes(rol) &&
      (
        metodo === "GET" ||
        metodo === "POST" ||
        metodo === "PATCH" ||
        metodo === "PUT"
      )
    );
  }

  // REPUESTOS
  if (
    ruta === "/repuestos" ||
    ruta.startsWith("/repuestos/")
  ) {
    const rolesOperativos: string[] = [
      ROLES.TECNICO,
      ROLES.SUPERVISOR,
    ];

    // Consultar repuestos y asociaciones.
    if (metodo === "GET") {
      return rolesOperativos.includes(rol);
    }

    // Asociar un repuesto a un mantenimiento.
    if (
      metodo === "POST" &&
      ruta === "/repuestos/mantenimiento"
    ) {
      return rolesOperativos.includes(rol);
    }

    // Eliminar una asociación de repuesto:
    // solo el supervisor, además del administrador.
    if (
      metodo === "DELETE" &&
      /^\/repuestos\/mantenimiento\/[^/]+$/.test(ruta)
    ) {
      return rol === ROLES.SUPERVISOR;
    }

    // Registrar o modificar el inventario de repuestos:
    // reservado al administrador.
    return false;
  }

  // Cualquier ruta no contemplada queda denegada.
  return false;
}

export function autorizarRol(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const usuario = res.locals.usuario as
    | UsuarioAutenticado
    | undefined;

  if (!usuario || typeof usuario.rol !== "string") {
    res.status(401).json({
      error: "Usuario no autenticado",
    });
    return;
  }

  const rol = usuario.rol.trim().toUpperCase();

  // Normalizar la ruta para que funcione con /api.
  const rutaOriginal = req.originalUrl.split("?")[0] ?? "";
  const ruta = rutaOriginal.replace(/^\/api(?=\/|$)/, "") || "/";
  const metodo = req.method.toUpperCase();

  const permitida = rutaPermitida(
    ruta,
    metodo,
    rol,
    usuario,
    req,
  );

  if (!permitida) {
    res.status(403).json({
      error: "No tienes permisos para realizar esta operación",
    });
    return;
  }

  next();
}
