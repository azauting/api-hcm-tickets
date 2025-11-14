import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { logger } from '../../utils/logger';
import { ticketLogService } from './ticketLog.service';

const log = logger.child({ ubicacion: 'ticketLogController' });

export const ticketLogController = {
    // controlador para crear un nuevo log de ticket movimiento
    createTicketLog: async (objetoMovimiento: TicketMovimientoCreateDTO) => {
        log.info({ objetoMovimiento }, 'Creando ticket movimiento log');

        // validar sólo los campos necesarios (fecha la pone la DB)
        if (!objetoMovimiento.ticket_id || !objetoMovimiento.tipo_movimiento_id || !objetoMovimiento.usuario_id) {
            log.error({ objetoMovimiento }, 'Datos incompletos para crear ticket movimiento log');
            return { status: 'error', message: 'Datos incompletos para crear ticket movimiento log' };
        }

        const result = await ticketLogService.createTicketLog(objetoMovimiento);
        if (result.status === 'error') {
            log.error({ objetoMovimiento }, 'Error creando ticket movimiento log');
            return { status: 'error', message: 'Error creando ticket movimiento log' };
        }

        log.info({ ticket_movimiento_id: result.ticket_movimiento_id }, 'Ticket movimiento log creado exitosamente');
        return { status: 'ok', message: 'Ticket movimiento log creado' };
    },
};

