import pool from '../../config/db.config';
import type { ResultSetHeader } from 'mysql2';
import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { logger } from '../../utils/logger';
import type { RowDataPacket } from 'mysql2';
const log = logger.child({ ubicacion: 'ticketLogService' });

export const ticketLogService = {

    // Crear log de movimiento
    createTicketLog: async (objetoMovimiento: TicketMovimientoCreateDTO) => {
        log.info({ action: 'createTicketLog', objetoMovimiento }, 'Insertando nuevo ticket_movimiento');
        try {
            const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO ticket_movimiento (ticket_id, movimiento_id, usuario_id, fecha)
                VALUES (?, ?, ?, NOW())`,
                [
                    objetoMovimiento.ticket_id,
                    objetoMovimiento.movimiento_id,
                    objetoMovimiento.usuario_id
                ]
            );

            return { status: 'ok', ticket_movimiento_id: result.insertId };

        } catch (err) {
            log.error({ err, objetoMovimiento }, 'Error insertando ticket_movimiento');
            return { status: 'error', message: 'Error al insertar movimiento' };
        }
    },

    // Obtener todos los movimientos
    getAllMovements: async () => {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                // el movimiento debe traer el nombre del usuario que hizo el movimiento y el nombre del tipo de movimiento
                `
            SELECT 
                tm.ticket_movimiento_id,
                tm.ticket_id,
                tm.movimiento_id,
                tm.fecha,
                u.nombre_completo,
                te.movimiento AS tipo_movimiento
            FROM ticket_movimiento tm
            JOIN usuario u ON u.usuario_id = tm.usuario_id
            JOIN tipo_movimiento te ON te.movimiento_id = tm.movimiento_id
            ORDER BY tm.fecha DESC;
            `
            );

            return { status: 'ok', data: rows };
        } catch (error) {
            log.error({ error }, 'Error en getAllMovements');
            return { status: 'error', message: 'Error al obtener movimientos' };
        }
    },

    // Obtener el movimiento más reciente (global)
    getLatestGlobalMovement: async () => {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
            SELECT 
                tm.ticket_movimiento_id,
                tm.ticket_id,
                tm.movimiento_id,
                tm.fecha,
                u.nombre_completo,
                te.movimiento AS tipo_movimiento
            FROM ticket_movimiento tm
            JOIN usuario u ON u.usuario_id = tm.usuario_id
            JOIN tipo_movimiento te ON te.movimiento_id = tm.movimiento_id
            ORDER BY tm.fecha DESC
            LIMIT 10;
            `
            );

            return { status: 'ok', data: rows[0] };
        } catch (error) {
            log.error({ error }, 'Error en obtener el ultimo movimiento');
            return { status: 'error', message: 'Error al obtener último movimiento' };
        }
    },
    
    // Obtener movimientos por usuario
    getMovementsByUser: async (usuarioId: number) => {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
            SELECT 
                tm.ticket_movimiento_id,
                tm.ticket_id,
                tm.movimiento_id,
                tm.fecha,
                te.movimiento AS tipo_movimiento
            FROM ticket_movimiento tm
            JOIN tipo_movimiento te ON te.movimiento_id = tm.movimiento_id
            WHERE tm.usuario_id = ?
            ORDER BY tm.fecha DESC;
            `,
                [usuarioId]
            );

            return { status: 'ok', data: rows };
        } catch (error) {
            log.error({ error }, 'Error al obtener movimiento del usuario');
            return { status: 'error', message: 'Error al obtener movimientos del usuario' };
        }
    },


};
