
import type {
  DashboardDAO
} from '../../dominio/puertos/index.js'

import type {
  Dashboard
} from '../../dominio/modelo/Dashboard.js'

export class ConsultarDashboard {

  constructor(
    private readonly dashboardDAO: DashboardDAO
  ) {}

  async ejecutar(): Promise<Dashboard> {

    return this.dashboardDAO.obtenerResumen()

  }
}
