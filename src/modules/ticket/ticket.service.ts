import type { Ticket, TicketMovimiento } from '../../utils/interfaces';
import pool from '../../config/db.config';
import { logger } from '../../utils/logger';

const log = logger.child({ service: 'ticketService' });

type GetTicketResult =
    | { status: 'ok'; ticket: Ticket }
    | { status: 'not_found' }
    | { status: 'error'; message: string };

type CreateTicketResult =
    | { status: 'ok'; ticket_id: number }
    | { status: 'error'; message: string };

export const ticketService = {
    createTicket: async (nuevoTicket: Ticket): Promise<CreateTicketResult> => {
        log.info({ action: 'createTicket', usuario_id_solicita: nuevoTicket.usuario_id_solicita }, 'Creando nuevo ticket' );
        
        try {
            const [result] = await pool.query(
                `INSERT INTO ticket 
                (usuario_id_solicita, asunto, descripcion, telefono, autor_problema, ubicacion_id, direccion_ip, estado_de_revision, tipo_prioridad_id, tipo_unidad_id, tipo_estado_id, tipo_origen_id, tipo_evento_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    nuevoTicket.usuario_id_solicita,
                    nuevoTicket.asunto,
                    nuevoTicket.descripcion,
                    nuevoTicket.telefono,
                    nuevoTicket.autor_problema,
                    nuevoTicket.ubicacion_id,
                    nuevoTicket.direccion_ip,
                    nuevoTicket.estado_de_revision,
                    nuevoTicket.tipo_prioridad_id,
                    nuevoTicket.tipo_unidad_id,
                    nuevoTicket.tipo_estado_id,
                    nuevoTicket.tipo_origen_id,
                    nuevoTicket.tipo_evento_id,
                ]
            );

            const insertedId = (result as any).insertId;

            log.info({ ticket_id: insertedId }, 'Ticket creado correctamente');

            return {
                status: 'ok',
                ticket_id: insertedId
            };
        } catch (error) {
            log.error({ err: error }, 'Error al crear el ticket');
            return {
                status: 'error',
                message: 'Error al crear el ticket'
            };
        }
    },


    getTicket: async (ticketId: number): Promise<GetTicketResult> => {
        log.info({ action: 'getTicketById', ticketId }, 'Obteniendo ticket por ID');

        if (!ticketId || ticketId <= 0) {
            log.warn({ ticketId }, 'ID de ticket inválido');
            return { status: 'error', message: 'ID de ticket inválido' };
        }

        try {
            const [rows] = await pool.query(
                `SELECT * FROM ticket WHERE ticket_id = ?`,
                [ticketId]
            );

            const tickets = rows as Ticket[];
            const ticket = tickets[0];

            if (!ticket) {
                log.warn({ ticketId }, 'Ticket no encontrado');
                return { status: 'not_found' };
            }

            log.info({ ticketId }, 'Ticket obtenido correctamente');
            return { status: 'ok', ticket };
        } catch (err) {
            log.error({ err, ticketId }, 'Error al obtener el ticket de la base de datos');
            return { status: 'error', message: 'Error al obtener el ticket' };
        }
    },
    createTicketLog: async (auditData: TicketMovimiento) => {
        log.info({ action: 'createTicketLog', usuario_id: auditData.usuario_id }, 'Creando log de ticket');

        try {
            const [result] = await pool.query(
                `INSERT INTO ticket_movimiento
                    (ticket_id, usuario_id, tipo_movimiento_id, fecha) 
                VALUES (?, ?, ?, NOW())`,
                [
                    auditData.ticket_id,
                    auditData.usuario_id,
                    auditData.tipo_movimiento_id,
                ]
            );

            const insertedId = (result as any).insertId;

            log.info({ ticket_log_id: insertedId }, 'Log de ticket creado correctamente');
            return { status: 'ok', ticket_log_id: insertedId };
        } catch (error) {
            log.error({ err: error }, 'Error al crear el log de ticket');
            return { status: 'error', message: 'Error al crear el log de ticket' };
        }
    }
};
