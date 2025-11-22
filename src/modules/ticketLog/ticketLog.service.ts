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
                `INSERT INTO ticket_movimiento (ticket_id, tipo_movimiento_id, usuario_id, fecha)
                VALUES (?, ?, ?, NOW())`,
                [
                    objetoMovimiento.ticket_id,
                    objetoMovimiento.tipo_movimiento_id,
                    objetoMovimiento.usuario_id
                ]
            );

            return { status: 'ok', ticket_movimiento_id: result.insertId };

        } catch (err) {
            log.error({ err, objetoMovimiento }, 'Error insertando ticket_movimiento');
            return { status: 'error', message: 'Error al insertar movimiento' };
        }
    },

    // Obtener movimientos de un ticket
    getTicketMovements: async (ticketId: number) => {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT 
                    tm.ticket_movimiento_id,
                    tm.ticket_id,
                    tm.tipo_movimiento_id,
                    tm.usuario_id,
                    u.nombre_completo,
                    tm.fecha
                FROM ticket_movimiento tm
                JOIN usuario u ON u.usuario_id = tm.usuario_id
                WHERE tm.ticket_id = ?
                ORDER BY tm.fecha ASC`,
                [ticketId]
            );

            if (!rows.length) {
                return { status: "empty" };
            }

            return { status: "ok", data: rows };

        } catch (error) {
            log.error({ error, ticketId }, "Error al obtener movimientos del ticket");
            return { status: "error", message: "Error al obtener movimientos del ticket" };
        }
    },

    // Último movimiento
    getLatestTicketMovement: async (ticketId: number) => {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT 
                    tm.ticket_movimiento_id,
                    tm.ticket_id,
                    tm.tipo_movimiento_id,
                    tm.usuario_id,
                    u.nombre_completo,
                    tm.fecha
                FROM ticket_movimiento tm
                JOIN usuario u ON u.usuario_id = tm.usuario_id
                WHERE tm.ticket_id = ?
                ORDER BY tm.fecha DESC
                LIMIT 1`,
                [ticketId]
            );

            if (!rows.length) {
                return { status: "empty" };
            }

            return { status: "ok", data: rows[0] };

        } catch (error) {
            log.error({ error, ticketId }, "Error en obtener el movimiento más reciente");
            return { status: "error", message: "Error al obtener movimiento más reciente" };
        }
    }
};
