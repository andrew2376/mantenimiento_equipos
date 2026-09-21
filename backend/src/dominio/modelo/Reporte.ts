export interface ResumenGeneralDTO {
  equipos: {
    total: number
    operativos: number
    enMantenimiento: number
    inactivos: number
  }
  tickets: {
    total: number
    abiertos: number
    enProceso: number
    resueltos: number
    tasaResolucion: number
  }
  mantenimientos: {
    total: number
    preventivos: number
    correctivos: number
    finalizados: number
    pendientes: number
  }
  repuestos: {
    totalReferencias: number
    unidadesEnStock: number
    unidadesConsumidas: number
    costoTotalInvertido: number
  }
  topEquiposIntervenidos: Array<{
    id: number
    codigo: string
    nombre: string
    totalMantenimientos: number
  }>
  topRepuestosUtilizados: Array<{
    id: number
    codigo: string
    nombre: string
    cantidadConsumida: number
    costoTotal: number
  }>
}
