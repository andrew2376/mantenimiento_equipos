import type {
  UsuarioDAO,
  ServicioClaves
} from '../../dominio/puertos/index.js'

export interface DatosCambioClave {
  usuarioId: number
  claveActual: string
  claveNueva: string
}

export class CambiarClave {

  constructor(
    private readonly usuarioDAO: UsuarioDAO,
    private readonly servicioClaves: ServicioClaves
  ) {}

  async ejecutar(datos: DatosCambioClave): Promise<void> {

    const { usuarioId, claveActual, claveNueva } = datos

    if (!claveActual || !claveNueva) {
      throw new Error('La contraseña actual y la nueva son obligatorias')
    }

    if (claveNueva.length < 8) {
      throw new Error('La nueva contraseña debe tener mínimo 8 caracteres')
    }

    if (!/[A-Z]/.test(claveNueva)) {
      throw new Error('La contraseña debe contener al menos una mayúscula')
    }

    if (!/[a-z]/.test(claveNueva)) {
      throw new Error('La contraseña debe contener al menos una minúscula')
    }

    if (!/[0-9]/.test(claveNueva)) {
      throw new Error('La contraseña debe contener al menos un número')
    }

    const usuario = await this.usuarioDAO.porId(usuarioId)

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    const claveCorrecta = await this.servicioClaves.comparar(
      claveActual,
      usuario.claveHash
    )

    if (!claveCorrecta) {
      throw new Error('La contraseña actual es incorrecta')
    }

    const mismaClave = await this.servicioClaves.comparar(
      claveNueva,
      usuario.claveHash
    )

    if (mismaClave) {
      throw new Error('La nueva contraseña debe ser diferente a la actual')
    }

    const nuevoHash = await this.servicioClaves.generarHash(claveNueva)

    await this.usuarioDAO.actualizar({
      ...usuario,
      claveHash: nuevoHash
    })
  }
}