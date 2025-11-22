import type { Request, Response } from 'express';
import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { logger } from '../../utils/logger';
import { ticketLogService } from './ticketLog.service';
import { parseIdParam, sendResponse } from '../../utils/helper';
import type { AuthRequest } from './../../utils/interfaces';

const log = logger.child({ ubicacion: 'ticketLogController' });

export const ticketLogController = {
    // controlador para crear un nuevo log de ticket movimiento
    createTicketLog: async (objetoMovimiento: TicketMovimientoCreateDTO) => {
        log.info({ objetoMovimiento }, 'Obteniendo data para crear ticket movimiento log');

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

        log.info({ ticket_movimiento_id: result.ticket_movimiento_id }, 'Ticket movimiento creado exitosamente', objetoMovimiento.tipo_movimiento_id);
        return { status: 'ok', message: 'Ticket movimiento log creado' };
    },

    getTicketMovements: async (req: AuthRequest, res: Response) => {
        try {
            const ticketId = parseIdParam(req.params.id);

            if (ticketId === null) {
                return sendResponse(res, 400, "El parámetro 'id' es inválido o no es numérico");
            }

            const movimientos = await ticketLogService.getTicketMovements(ticketId);

            return sendResponse(res, 200, "Movimientos obtenidos correctamente", { movimientos });

        } catch (error) {
            log.error({ error }, "Error en getTicketMovements");
            return sendResponse(res, 500, "Error al obtener los movimientos del ticket");
        }
    },
    getLatestTicketMovement: async (req: AuthRequest, res: Response) => {
        try {
            const ticketId = Number(req.params.id);

            if (ticketId === null) {
                return sendResponse(res, 400, "El parámetro 'id' es inválido o no es numérico");
            }

            const movimiento = await ticketLogService.getLatestTicketMovement(ticketId);

            if (!movimiento) {
                return sendResponse(res, 404, "No existe un movimiento para este ticket");
            }

            return sendResponse(res, 200, "Movimiento más reciente obtenido correctamente", { movimiento });

        } catch (error) {
            log.error({ error }, "Error en getLatestTicketMovement");
            return sendResponse(res, 500, "Error al obtener movimiento más reciente");
        }
    }
};



