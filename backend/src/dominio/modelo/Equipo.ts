export interface Equipo {
  id: number
  codigoInventario: string
  nombre: string
  tipo: string
  marca: string
  modelo?: string
  numeroSerie?: string
  ubicacion: string
  estado: number
  createdAt: Date
  updatedAt: Date
}