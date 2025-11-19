import type { Ticket, TicketCreateDTO, TicketMovimiento, TipoEstado } from '../../utils/interfaces';
import type { ResultSetHeader } from 'mysql2';
import pool from '../../config/db.config';
import { logger } from '../../utils/logger';
import type {
    CreateTicketResult,
    GetTicketResult,
    GetAllTipoEstado,
    GetPriorityType,
    GetOriginType,
    GetEventType,
    GetUbicationType,
    GetUnityType,
    GetTicketsType,
    CancelTicketResult
} from '../../utils/types';

const log = logger.child({ service: 'ticketService' });



export const ticketService = {
    createTicket: async (ticketObjeto: TicketCreateDTO): Promise<CreateTicketResult> => {
        log.info({ action: 'createTicketService', usuario_id_solicita: ticketObjeto.usuario_id_solicita }, 'Recibiendo datos del controller nuevo ticket');
        // primera parte, crea el ticket
        try {
            const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO ticket 
                    (usuario_id_solicita, asunto, descripcion, telefono, autor_problema, ubicacion_id, direccion_ip, estado_de_revision, tipo_prioridad_id, tipo_unidad_id, tipo_estado_id, tipo_origen_id, tipo_evento_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    ticketObjeto.usuario_id_solicita,
                    ticketObjeto.asunto,
                    ticketObjeto.descripcion,
                    ticketObjeto.telefono,
                    ticketObjeto.autor_problema,
                    ticketObjeto.ubicacion_id,
                    ticketObjeto.direccion_ip,
                    ticketObjeto.estado_de_revision,
                    ticketObjeto.tipo_prioridad_id,
                    ticketObjeto.tipo_unidad_id,
                    ticketObjeto.tipo_estado_id,
                    ticketObjeto.tipo_origen_id,
                    ticketObjeto.tipo_evento_id,
                ]
            );

            const insertedId = result.insertId;
            log.info({ ticket_id: insertedId }, 'Consulta SQL para crear ticket ejecutada correctamente');
            return { status: 'ok', ticket_id: insertedId };
        } catch (error) {
            log.error({ err: error }, 'Error al crear el ticket');
            return {
                status: 'error',
                message: 'Error al crear el ticket'
            };
        }
    },
    // por si se genera un error al crear un ticket
    deleteTicketId: async (ticket_id: number): Promise<void> => {
        log.info({ action: 'deleteTicketId', ticket_id }, 'Eliminando ticket por ID');
        try {
            await pool.query(`DELETE FROM ticket WHERE ticket_id = ?`, [ticket_id]);
            log.info({ ticket_id }, 'Ticket eliminado correctamente');
        } catch (error) {
            log.error({ err: error, ticket_id }, 'Error al eliminar el ticket');
        }
    },
    getTicketId: async (ticketId: number): Promise<GetTicketResult> => {
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
    getAllTipoEstado: async (): Promise<GetAllTipoEstado> => {
        log.info({ action: 'getAllTipoEstado' }, 'Obteniendo todos los tipos de estado');

        try {
            const [rows] = await pool.query(
                `SELECT tipo_estado_id, estado FROM tipo_estado`
            )

            const estados = rows as TipoEstado[];

            // si no hay estados, retornar vacío
            if (!estados.length) {
                log.warn('No se encontraron tipos de estado');
                return { status: 'empty' };
            }
            log.info('Tipos de estado obtenidos correctamente');
            return { status: 'ok', estados };



        } catch (error) {
            log.error({ err: error }, 'Error al obtener los tipos de estado');
            return { status: 'error', message: 'Error al obtener los tipos de estado' };
        }
    },
    getAllTipoPrioridad: async (): Promise<GetPriorityType> => {
        log.info({ action: 'getAllTipoPrioridad' }, 'Obteniendo todas las prioridades');

        try {
            const [rows] = await pool.query(`
            SELECT tipo_prioridad_id, prioridad FROM tipo_prioridad; `);

            const prioridades = rows as { tipo_prioridad_id: number; prioridad: string }[];

            if (!prioridades.length) {
                log.warn('No se encontraron prioridades registradas');
                return { status: 'empty' };
            }

            log.info('Tipos de prioridad obtenidos correctamente');
            return { status: 'ok', prioridades: prioridades };
        } catch (error) {
            log.error({ error }, 'Error al obtener los tipos de prioridad');
            return { status: 'error', message: 'Error al obtener los tipos de prioridad' };
        }
    },
    getAllTipoOrigen: async (): Promise<GetOriginType> => {
        log.info({ action: 'getAllTipoOrigen' }, 'Obteniendo todos los tipos de origen');

        try {
            const [rows] = await pool.query(
                `SELECT tipo_origen_id, origen FROM tipo_origen`
            );

            const origen = rows as { tipo_origen_id: number; origen: string }[];

            if (!origen.length) {
                log.warn('No se encontraron tipos de origen');
                return { status: 'empty' };
            }

            log.info('Tipos de origen obtenidos correctamente');
            return { status: 'ok', origen };

        } catch (error) {
            log.error({ err: error }, 'Error al obtener los tipos de origen');
            return { status: 'error', message: 'Error al obtener los tipos de origen' };
        }
    },
    getAllTipoEvento: async (): Promise<GetEventType> => {
        log.info({ action: 'GetAlltipoEvento' }, 'Obteniendo todos los tipos de evento');

        try {
            const [rows] = await pool.query(
                'SELECT tipo_evento_id,evento FROM tipo_evento'
            )

            const eventos = rows as { tipo_evento_id: number; evento: string }[];

            if (!eventos.length) {
                log.warn('no se encontraron tipos de eventos')
                return { status: 'empty' }
            }

            log.info('tipo de evento obtenido correctamente')
            return { status: 'ok', eventos }

        } catch (error) {
            log.error({ err: error }, 'Error al obtener los tipos de evento');
            return { status: 'error', message: 'Error al obtener los tipos de evento' };
        }
    },
    getAllUbicacion: async (): Promise<GetUbicationType> => {
        log.info([{ action: 'GetAllUbicacion' }], 'obteniendo todas las ubicaciones')


        try {
            const [rows] = await pool.query('SELECT ubicacion.ubicacion_id,ubicacion.ubicacion,ubicacion.area_id,area.nombre_area FROM ubicacion JOIN area ON ubicacion.area_id = area.area_id;')

            const ubicaciones = rows as {
                ubicacion_id: number;
                ubicacion: string;
                area_id: number;
                nombre_area: string;
            }[];


            if (!ubicaciones.length) {
                log.warn('no se encontraron ubicaciones')
                return { status: 'empty' }
            }

            log.info('ubicaciones obtenidas correctamente')
            return { status: 'ok', ubicaciones }

        } catch (error) {
            log.error({ err: error }, 'error al obtener las ubicaciones');
            return { status: 'error', message: 'error al obtener todas las ubicaciones' }
        }

    },
    getAllUnidad: async (): Promise<GetUnityType> => {
        log.info({ action: 'GetAllUnidad' }, 'obteniendo todos los tipos de unidad')

        try {
            const [rows] = await pool.query('SELECT unidad_id,tipo_unidad FROM tipo_unidad')

            const unidades = rows as {
                unidad_id: number,
                tipo_unidad: string;
            }[];

            if (!unidades.length) {
                log.warn('no se encontraron las unidades')
                return { status: 'empty' }
            }
            log.info('ubicaciones obtenidas correctamente')
            return { status: 'ok', unidades };

        } catch (error) {
            log.error({ err: error }, 'error al obtener las unidades')
            return { status: 'error', message: 'error al obtener todas las unidades' }
        }

    },
    getAllTicket: async (userId: number, params: { page: number; limit: number; offset: number; filters: any }
    ): Promise<GetTicketsType> => {


        const { page, limit, offset, filters } = params;

        log.info({ userId, filters, page, limit }, 'obteniendo tickets del usuario con filtros y paginación');

        try {
            const whereConditions = ["usuario_id_solicita = ?"];
            const values: any[] = [userId];

            if (filters.estado) {
                whereConditions.push("tipo_estado_id = ?");
                values.push(filters.estado);
            }

            if (filters.prioridad) {
                whereConditions.push("tipo_prioridad_id = ?");
                values.push(filters.prioridad);
            }

            if (filters.evento) {
                whereConditions.push("tipo_evento_id = ?");
                values.push(filters.evento);
            }

            if (filters.ubicacion) {
                whereConditions.push("ubicacion_id = ?");
                values.push(filters.ubicacion);
            }

            const whereSql = `WHERE ${whereConditions.join(" AND ")}`;

            const [rows] = await pool.query(
                `
            SELECT
                ticket_id,
                asunto,
                descripcion,
                telefono,
                autor_problema,
                ubicacion_id,
                tipo_estado_id,
                tipo_prioridad_id,
                tipo_evento_id
            FROM ticket
            ${whereSql}
            ORDER BY ticket_id DESC
            LIMIT ? OFFSET ?
            `,
                [...values, limit, offset]
            );

            const tickets = rows as Ticket[];

            if (!tickets.length) {
                log.warn({ userId }, 'no se encontraron tickets para este usuario');
                return { status: 'empty' };
            }

            log.info(
                { count: tickets.length, page, limit },
                'tickets obtenidos correctamente para el usuario'
            );

            return {
                status: 'ok', tickets: tickets, pagination: { page, limit, count: tickets.length }
            };

        } catch (error) {
            log.error({ error, userId }, 'error al obtener los tickets');
            return { status: 'error', message: 'error al obtener los tickets' };
        }
    },
    cancelTicketById: async (ticketId: number, userId: number): Promise<CancelTicketResult> => {
        try {
            // 1. Obtener ticket
            const [rows] = await pool.query(
                `SELECT ticket_id, usuario_id_solicita,
                    (SELECT fecha FROM ticket_movimiento 
                    WHERE ticket_id = ? 
                    ORDER BY fecha ASC LIMIT 1) AS fecha_creacion
                    FROM ticket
                    WHERE ticket_id = ?`,
                [ticketId, ticketId]
            );

            const ticket = (rows as any)[0];

            if (!ticket) {
                return { status: "error", message: "Ticket no encontrado" };
            }

            // Validar userId
            if (ticket.usuario_id_solicita !== userId) {
                return { status: "forbidden", message: "No puedes cancelar un ticket que no creaste" };
            }

            // Verificar tiempo (5 minutos)
            const fechaCreacion = new Date(ticket.fecha_creacion);
            const ahora = new Date();
            const minutos = (ahora.getTime() - fechaCreacion.getTime()) / 1000 / 60;

            // si pasaron más de 5 minutos ya no se puede cancelar el ticket
            if (minutos > 5) {
                return { status: "tiempo expirado", message: "Ya no puedes cancelar el ticket (pasaron más de 5 minutos)" };
            }

            // ELIMINAR PRIMERO ticket_movimiento
            await pool.query(`DELETE FROM ticket_movimiento WHERE ticket_id = ?`, [ticketId]);

            // ELIMINAR ticket
            await pool.query(`DELETE FROM ticket WHERE ticket_id = ?`, [ticketId]);

            return { status: "ok" };

        } catch (error) {
            log.error({ err: error, ticketId, userId }, 'Error al cancelar el ticket');
            return { status: "error", message: "Error al cancelar el ticket" };
        }
    },


};