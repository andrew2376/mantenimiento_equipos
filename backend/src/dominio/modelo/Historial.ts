export interface EventoHistorial {
  id: string
  fecha: string
  tipo: 'TICKET' | 'MANTENIMIENTO' | 'REPUESTO'
  titulo: string
  descripcion: string
  estado?: string
  responsable?: string
  costo?: number
}

export interface HistorialEquipoDTO {
  equipo: {
    id: number
    codigoInventario: string
    nombre: string
    tipo: string
    marca: string
    modelo: string | null
    numeroSerie: string | null
    ubicacion: string
    estado: number
    creadoEn: string
  }
  estadisticas: {
    totalTickets: number
    totalMantenimientos: number
    totalRepuestosUsados: number
    costoTotalRepuestos: number
  }
  lineaDeTiempo: EventoHistorial[]
}
