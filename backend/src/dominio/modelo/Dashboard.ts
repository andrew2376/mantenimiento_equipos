
export interface DistribucionDashboard {
  nombre: string
  cantidad: number
}

export interface ResumenEquiposDashboard {
  total: number
  activos: number
  inactivos: number
}

export interface ResumenTicketsDashboard {
  total: number
  pendientes: number
  criticosPendientes: number
  resueltos: number
  porEstado: DistribucionDashboard[]
  porPrioridad: DistribucionDashboard[]
}

export interface ResumenMantenimientosDashboard {
  total: number
  pendientes: number
  enProceso: number
  finalizados: number
  preventivos: number
  correctivos: number
  porEstado: DistribucionDashboard[]
  porTipo: DistribucionDashboard[]
}

export interface ResumenRepuestosDashboard {
  total: number
  activos: number
  unidadesDisponibles: number
  agotados: number
  valorInventario: number
}

export interface ActividadMensualDashboard {
  mes: string
  tickets: number
  mantenimientos: number
}

export interface TicketRecienteDashboard {
  id: number
  titulo: string
  estado: string
  prioridad: string
  equipo: string
  creadoEn: Date
}

export interface MantenimientoRecienteDashboard {
  id: number
  descripcion: string
  tipo: string
  estado: string
  equipoId: number
  fecha: Date
}

export interface EquipoFrecuenteDashboard {
  id: number
  nombre: string
  codigoInventario: string
  cantidadMantenimientos: number
}

export interface RepuestoAgotadoDashboard {
  id: number
  nombre: string
  codigo: string
  stock: number
}

export interface Dashboard {
  equipos: ResumenEquiposDashboard
  tickets: ResumenTicketsDashboard
  mantenimientos: ResumenMantenimientosDashboard
  repuestos: ResumenRepuestosDashboard

  actividadMensual: ActividadMensualDashboard[]

  ticketsRecientes: TicketRecienteDashboard[]
  mantenimientosRecientes: MantenimientoRecienteDashboard[]
  equiposFrecuentes: EquipoFrecuenteDashboard[]
  repuestosAgotados: RepuestoAgotadoDashboard[]

  actualizadoEn: Date
}
