import bcrypt from 'bcryptjs'

import type {
  ServicioClaves
} from '../../dominio/puertos/index.js'

export class ServicioClavesBcrypt
  implements ServicioClaves {

  async generarHash(
    clave: string
  ): Promise<string> {
    return bcrypt.hash(clave, 10)
  }

  async comparar(
    clave: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(clave, hash)
  }
}