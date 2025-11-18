import pool from '../../config/db.config';
import type { ResultSetHeader } from 'mysql2';
import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { logger } from '../../utils/logger';

const log = logger.child({ ubicacion: 'ticketLogService' });

export const ticketLogService = {
    // versión simple (usa pool directamente)
    createTicketLog: async (objetoMovimiento: TicketMovimientoCreateDTO) => {
        log.info({ action: 'createTicketLog', objetoMovimiento }, 'Insertando nuevo ticket_movimiento');
        try {
            const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO ticket_movimiento (ticket_id, tipo_movimiento_id, usuario_id, fecha)
                VALUES (?, ?, ?, NOW())`,
                [objetoMovimiento.ticket_id, objetoMovimiento.tipo_movimiento_id, objetoMovimiento.usuario_id]
            );

            return { status: 'ok', ticket_movimiento_id: result.insertId };
        } catch (err) {
            log.error({ err, objetoMovimiento }, 'Error insertando ticket_movimiento');
            return { status: 'error', message: 'Error al insertar movimiento' };
        }
    },
};