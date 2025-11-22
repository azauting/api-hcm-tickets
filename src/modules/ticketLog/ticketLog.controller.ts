import type { Request, Response } from 'express';
import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { logger } from '../../utils/logger';
import { ticketLogService } from './ticketLog.service';
import { parseIdParam, sendResponse } from '../../utils/helper';

const log = logger.child({ ubicacion: 'ticketLogController' });

export const ticketLogController = {

    //crear ticket log
    createTicketLog: async (objetoMovimiento: TicketMovimientoCreateDTO) => {
        log.info({ objetoMovimiento }, 'Obteniendo data para crear ticket movimiento log');

        if (!objetoMovimiento.ticket_id ||!objetoMovimiento.tipo_movimiento_id ||!objetoMovimiento.usuario_id) {

            log.error({ objetoMovimiento }, 'Datos incompletos para crear ticket movimiento log');
            return { status: 'error', message: 'Datos incompletos para crear ticket movimiento log' };
        }

        const result = await ticketLogService.createTicketLog(objetoMovimiento);

        if (result.status === 'error') {
            log.error({ objetoMovimiento }, 'Error creando ticket movimiento log');
            return { status: 'error', message: 'Error creando ticket movimiento log' };
        }

        log.info(
            { ticket_movimiento_id: result.ticket_movimiento_id },
            'Ticket movimiento creado exitosamente'
        );

        return { status: 'ok', message: 'Ticket movimiento log creado' };
    },

    // obtener todos los movimientos de db
    getAllMovements: async (req: Request, res: Response) => {
        const result = await ticketLogService.getAllMovements();

        if (result.status !== 'ok') {
            return sendResponse(res, 500, result.message || "Error al obtener movimientos");
        }

        return sendResponse(res, 200, "Movimientos obtenidos correctamente", result.data);
    },

    //obtener el ultimo movimiento de db
    getLatestGlobalMovement: async (req: Request, res: Response) => {
        const result = await ticketLogService.getLatestGlobalMovement();

        if (result.status !== 'ok') {
            return sendResponse(res, 500, result.message || "Error al obtener último movimiento");
        }

        return sendResponse(res, 200, "Último movimiento obtenido", result.data);
    },

    // obtener movimientos por id de usuario
    getMovementsByUser: async (req: Request, res: Response) => {
        const usuarioId = parseIdParam(req.params.id);


        if (usuarioId === null) {
            return sendResponse(res, 400, "El ID no es válido");
        }

        const result = await ticketLogService.getMovementsByUser(usuarioId);

        // 3. Si falla el service
        if (result.status !== 'ok') {
            return sendResponse(res,500,result.message || "Error al obtener movimientos del usuario");
        }

        
        const movimientos = result.data ?? [];

        
        if (movimientos.length === 0) {
            return sendResponse(res,200,`El usuario no tiene movimientos registrados`,[]);
        }

        return sendResponse(res,200,"Movimientos del usuario obtenidos",movimientos);
    }
};
