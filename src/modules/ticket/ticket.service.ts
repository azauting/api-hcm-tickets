import type { Ticket, TicketCreateDTO, TicketDetalleObservacion, TipoEstado, TipoEvento, TipoOrigen, TipoPrioridad, TipoUnidad, Ubicacion, TicketDetalle } from '../../utils/interfaces';
import type { ResultSetHeader } from 'mysql2';
import pool from '../../config/db.config';
import { logger } from '../../utils/logger';
import type { CreateTicketResult, GetTicketResult, GetTicketsType, CancelTicketResult, ApiResponse } from '../../utils/types';
import type { RowDataPacket } from 'mysql2';

const log = logger.child({ service: 'ticketService' });


export const ticketService = {
    // TODO: Crear ticket - estado: ✅
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
    // TODO: Crear ticket detalle - estado: ✅
    createTicketDetalle: async (ticketId: number): Promise<ApiResponse<TicketDetalle>> => {
        try {
            const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO ticket_detalle (ticket_id, respuesta, soporte_asignado)
                VALUES (?, '', NULL)`,
                [ticketId]
            );

            return {
                status: 'ok',
                data: [{
                    ticket_detalle_id: result.insertId,
                    ticket_id: ticketId,
                    respuesta: '',
                    soporte_asignado: null
                }]
            };

        } catch (error) {
            return { status: 'error', message: 'Error al crear ticket_detalle' };
        }
    },
    // TODO: crear detalle observacion - pendiente a revisar
    ticketObservation: async (ticketId: number, observacion: string, userId: number): Promise<ApiResponse<TicketDetalleObservacion>> => {

        try {
            // Verificar si existe ticket_detalle para ese ticket
            const [detalleRows] = await pool.query<RowDataPacket[]>(
                `SELECT ticket_detalle_id 
                FROM ticket_detalle 
                WHERE ticket_id = ?`,
                [ticketId]
            );

            const detalle = detalleRows[0] as TicketDetalle

            if (!detalle) {
                return { status: 'error', message: 'El ticket no tiene un detalle asociado' };
            }

            //insertar la observacion
            const [insertResult] = await pool.query<ResultSetHeader>(
                `INSERT INTO ticket_detalle_observacion 
                (ticket_detalle_id, observacion, usuario_id)
                VALUES (?, ?, ?)`,
                [detalle.ticket_detalle_id, observacion, userId]
            );

            const newObservation: TicketDetalleObservacion = {
                ticket_detalle_observacion_id: insertResult.insertId,
                ticket_detalle_id: detalle.ticket_detalle_id,
                observacion,
                usuario_id: userId
            };


            return { status: 'ok', data: [newObservation] };


        } catch (error) {
            log.error({ error }, 'Error al agregar observación al ticket detalle');
            return { status: 'error', message: 'Error al agregar la observación' };

        }
    },
    // TODO: borrar ticket completo - preguntar al hospital
    deleteTicketCompleto: async (ticketId: number): Promise<void> => {
        try {
            // 1. obtener ticket_detalle_id asociados
            const [rows] = await pool.query(
                `SELECT ticket_detalle_id FROM ticket_detalle WHERE ticket_id = ?`,
                [ticketId]
            );

            const detalles = rows as { ticket_detalle_id: number }[];

            // 2. borrar observaciones
            if (detalles.length > 0) {
                const ids = detalles.map(d => d.ticket_detalle_id);

                await pool.query(
                    `DELETE FROM ticket_detalle_observacion WHERE ticket_detalle_id IN (?)`,
                    [ids]
                );

                await pool.query(
                    `DELETE FROM ticket_detalle_integrante WHERE ticket_detalle_id IN (?)`,
                    [ids]
                );
            }

            // 3. borrar detalle
            await pool.query(`DELETE FROM ticket_detalle WHERE ticket_id = ?`, [ticketId]);

            // 4. borrar movimientos
            await pool.query(`DELETE FROM ticket_movimiento WHERE ticket_id = ?`, [ticketId]);

            // 5. borrar ticket
            await pool.query(`DELETE FROM ticket WHERE ticket_id = ?`, [ticketId]);

        } catch (error) {
            log.error({ error, ticketId }, "Error en deleteTicketCompleto");
        }
    },
    // TODO: REVISAR ESTO! - preguntar al hospital
    cancelTicketById: async (ticketId: number, userId: number): Promise<CancelTicketResult> => {
        try {
            // 1. Obtener ticket
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT ticket_id, usuario_id_solicita,
                    (SELECT fecha FROM ticket_movimiento 
                    WHERE ticket_id = ? 
                    ORDER BY fecha ASC LIMIT 1) AS fecha_creacion
                    FROM ticket
                    WHERE ticket_id = ?`,
                [ticketId, ticketId]
            );

            const ticket = rows[0]
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
    // TODO: ver un ticket por ID - estado: ✅
    getTicketId: async (ticketId: number): Promise<GetTicketResult> => {
        log.info({ action: 'getTicketById', ticketId }, 'Obteniendo ticket por ID');

        if (!ticketId || ticketId <= 0) {
            log.warn({ ticketId }, 'ID de ticket inválido');
            return { status: 'error', message: 'ID de ticket inválido' };
        }

        try {
            const [rows] = await pool.query<Ticket[] & RowDataPacket[]>(
                `SELECT * FROM ticket WHERE ticket_id = ?`,
                [ticketId]
            );
            // si no hay filas, retornar no encontrado
            // si hay filas, retornar el ticket
            const ticket = rows[0];

            if (!ticket) {
                log.warn({ ticketId }, 'Ticket no encontrado');
                return { status: 'not_found', message: 'Ticket no encontrado' };
            }

            log.info({ ticketId }, 'Ticket obtenido correctamente');
            return { status: 'ok', ticket };

        } catch (error) {
            log.error({ error, ticketId }, 'Error al obtener el ticket de la base de datos');
            return { status: 'error', message: 'Error al obtener el ticket' };
        }
    },
    // TODO: ver mis tickets creados - estado: ✅
    getAllTicketByUserId: async (userId: number, params: { page: number; limit: number; offset: number; filters: any }): Promise<GetTicketsType> => {

        const { page, limit, offset, filters } = params;

        log.info({ userId, filters, page, limit }, 'obteniendo tickets del usuario con filtros y paginación');

        try {
            const whereConditions = ["usuario_id_solicita = ?"];
            const values: any[] = [userId];

            // filtros
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

            return {status: 'ok',tickets,pagination: { page, limit, count: tickets.length }};

        } catch (error) {
            log.error({ error, userId }, 'error al obtener los tickets');
            return { status: 'error', message: 'error al obtener los tickets' };
        }
    },
    // TODO: actualizar ticket por admin - estado: ✅
    updateTicketAdmin: async (ticketId: number, updateData: any) => {
        try {
            // si no viene nada para actualizar
            if (!updateData || typeof updateData !== 'object') {
                return { status: 'error', message: 'Datos inválidos' };
            }
            // ejecuta el update directo
            const [result] = await pool.query<ResultSetHeader>(
                'UPDATE ticket SET ? WHERE ticket_id = ?',
                [updateData, ticketId]
            );
            // si el ticket no existe
            if (result.affectedRows === 0) {
                return { status: 'not_found', message: 'Ticket no encontrado' };
            }
            return { status: 'ok' };
        } catch (error) {
            log.error({ error, ticketId, updateData }, 'Error en updateTicketAdmin');
            return { status: 'error', message: 'No se pudo actualizar el ticket' };
        }
    },
    // TODO: asignar soporte a ticket - estado: ✅ (FALTA REVISAR)
    assignTicket: async (ticket_id: number, soporte_asignado: number) => {
        log.info({ action: 'assignTicket', ticket_id, soporte_asignado }, 'Asignando soporte al ticket');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT ticket_detalle_id FROM ticket_detalle WHERE ticket_id = ?`,
                [ticket_id]
            );

            const detalle = rows[0]

            if (!detalle) {
                return {
                    status: 'not_found',
                    message: 'El ticket no tiene un detalle creado'
                };
            }

            const [update] = await pool.query<ResultSetHeader>(
                `UPDATE ticket_detalle
                SET soporte_asignado = ?
                WHERE ticket_id = ?`,
                [soporte_asignado, ticket_id]
            );

            if (update.affectedRows === 0) {
                return {status: 'error',message: 'No se pudo asignar el ticket'};}

            return {status: 'ok',ticket_detalle_id: detalle.ticket_detalle_id,soporte_asignado};

        } catch (error) {
            log.error({ error, ticket_id, soporte_asignado }, 'Error al asignar soporte');
            return {status: 'error', message: 'Error interno al asignar soporte'};
        }
    },
    // TODO: crear detalle integrante - estado: ✅ (FALTA REVISAR)
    addTicketMember: async (ticket_id: number, usuario_id: number, usuario_id_solicitante: number) => {
        log.info({ action: 'addTicketMember', ticket_id, usuario_id, usuario_id_solicitante }, 'Agregando integrante al ticket');
        try {
            // 1. Verificar si el ticket tiene detalle
            const [detalleRows] = await pool.query<RowDataPacket[]>(
                `SELECT ticket_detalle_id FROM ticket_detalle WHERE ticket_id = ?`,
                [ticket_id]
            );
            const detalle = detalleRows[0];

            if (!detalle) {
                return { status: 'not_found', message: 'El ticket no tiene un detalle asociado' };
            }   
            // verificamos si existe la tabla ticket_detalle_integrante para ese ticket_detalle_id y usuario_id
            const [existingRows] = await pool.query<RowDataPacket[]>(
                `SELECT ticket_detalle_integrante_id
                FROM ticket_detalle_integrante
                WHERE ticket_detalle_id = ? AND usuario_id = ?`,
                [detalle.ticket_detalle_id, usuario_id]
            );
            // si ya existe, retornamos error
            if (existingRows.length > 0) {
                return { status: 'error', message: 'El integrante ya está asignado al ticket' };
            }
            // 2. Si no existe, insertamos el nuevo integrante
            const [insertResult] = await pool.query<ResultSetHeader>(
                `INSERT INTO ticket_detalle_integrante 
                (ticket_detalle_id, usuario_id)
                VALUES (?, ?, ?)`,
                [detalle.ticket_detalle_id, usuario_id]
            );
            if (insertResult.affectedRows === 0) {
                return { status: 'error', message: 'No se pudo agregar el integrante' };
            }
            return { status: 'ok', ticket_detalle_integrante_id: insertResult.insertId };
        } catch (error) {
            log.error({ error, ticket_id, usuario_id, usuario_id_solicitante }, 'Error al agregar integrante al ticket');
            return { status: 'error', message: 'Error al agregar el integrante' };
        }
    },
    // TODO: actualizar ticket por soporte/administrador - estado: ✅ (FALTA REVISAR)
    updateTicketSupport: async (ticketId: number, updateData: any) => {
        log.info({ action: 'updateTicketSupport', ticketId, updateData }, 'Actualizando ticket por soporte/administrador');
        try {
            // si no viene nada para actualizar
            if (!updateData || typeof updateData !== 'object') {
                return { status: 'error', message: 'Datos inválidos' };
            }
            // ejecuta el update directo
            const [result] = await pool.query<ResultSetHeader>(
                'UPDATE ticket SET ? WHERE ticket_id = ?',
                [updateData, ticketId]
            );
            // si el ticket no existe
            if (result.affectedRows === 0) {
                return { status: 'not_found', message: 'Ticket no encontrado' };
            }
            return { status: 'ok', message: 'Ticket actualizado correctamente' };
        } catch (error) {
            log.error({ error, ticketId, updateData }, 'Error en updateTicketSupport');
            return { status: 'error', message: 'No se pudo actualizar el ticket' };
        }
    },
    // TODO MOSTRAR TODOS LOS TICKETS CON estado_revision = 0 (significa sin revisar)
    getUnreviewedTickets: async (): Promise<ApiResponse<Ticket>> => {
        log.info({ action: 'getUnreviewedTickets' }, 'Obteniendo tickets sin revisar');
        try {
            const [rows] = await pool.query<Ticket[] & RowDataPacket[]>(
                `SELECT * FROM ticket WHERE estado_de_revision = 0
                ORDER BY ticket_id DESC`
            );
            const tickets = rows as Ticket[];
            if (!tickets.length) {
                log.warn('No se encontraron tickets sin revisar');
                return { status: 'empty' };
            }
            log.info('Tickets sin revisar obtenidos correctamente');
            return { status: 'ok', data: tickets };
        } catch (error) {
            log.error({ error }, 'Error al obtener tickets sin revisar');
            return { status: 'error', message: 'Error al obtener tickets sin revisar' };
        }
    },
    // TODO: service para obtener los tickets por unidad - estado: ✅
    getTicketsByUnitId: async (unidad_id: number): Promise<ApiResponse<Ticket>> => {
        log.info({ action: 'getTicketsByUnitId', unidad_id }, 'Obteniendo tickets por unidad');
        try {
            const [rows] = await pool.query<Ticket[] & RowDataPacket[]>(
                `SELECT * FROM ticket WHERE ubicacion_id = ?`,
                [unidad_id]
            );  
            const tickets = rows as Ticket[];

            if (!tickets.length) {
                log.warn({ unidad_id }, 'No se encontraron tickets para esta unidad');
                return { status: 'empty' };
            }

            log.info({ unidad_id }, 'Tickets obtenidos correctamente');
            return { status: 'ok', data: tickets };

        } catch (error) {
            log.error({ error, unidad_id }, 'Error al obtener tickets por unidad');
            return { status: 'error', message: 'Error al obtener tickets por unidad' };
        }
    },
    // TODO :SERVICES PARA LOS ESTADOS, PRIORIDADES, ORIGEN, EVENTO, UNIDAD, UBICACION - estado: ✅
    getAllTipoEstado: async (): Promise<ApiResponse<TipoEstado>> => {
        log.info({ action: 'getAllTipoEstado' }, 'Obteniendo todos los tipos de estado');

        try {
            const [rows] = await pool.query(
                `SELECT tipo_estado_id, estado FROM tipo_estado`
            );

            const estados = rows as TipoEstado[];

            if (!estados.length) {
                log.warn('No se encontraron tipos de estado');
                return { status: 'empty' };
            }

            log.info('Tipos de estado obtenidos correctamente');
            return { status: 'ok', data: estados };

        } catch (error) {
            log.error({ err: error }, 'Error al obtener los tipos de estado');
            return { status: 'error', message: 'Error al obtener los tipos de estado' };
        }
    },
    getAllTipoPrioridad: async (): Promise<ApiResponse<TipoPrioridad>> => {
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
            return { status: 'ok', data: prioridades };
        } catch (error) {
            log.error({ err: error }, 'Error al obtener los tipos de prioridad');
            return { status: 'error', message: 'Error al obtener los tipos de prioridad' };
        }
    },
    getAllTipoOrigen: async (): Promise<ApiResponse<TipoOrigen>> => {
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
            return { status: 'ok', data: origen };

        } catch (error) {
            log.error({ err: error }, 'Error al obtener los tipos de origen');
            return { status: 'error', message: 'Error al obtener los tipos de origen' };
        }
    },
    getAllTipoEvento: async (): Promise<ApiResponse<TipoEvento>> => {
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
            return { status: 'ok', data: eventos }

        } catch (error) {
            log.error({ err: error }, 'Error al obtener los tipos de evento');
            return { status: 'error', message: 'Error al obtener los tipos de evento' };
        }
    },
    getAllUbicacion: async (): Promise<ApiResponse<Ubicacion>> => {
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
            return { status: 'ok', data: ubicaciones }

        } catch (error) {
            log.error({ err: error }, 'error al obtener las ubicaciones');
            return { status: 'error', message: 'error al obtener todas las ubicaciones' }
        }

    },
    getAllUnidad: async (): Promise<ApiResponse<TipoUnidad>> => {
        log.info({ action: 'GetAllUnidad' }, 'obteniendo todos los tipos de unidad')

        try {
            const [rows] = await pool.query('SELECT unidad_id,tipo_unidad FROM tipo_unidad')

            const unidades = rows as { unidad_id: number, tipo_unidad: string; }[];

            if (!unidades.length) {
                log.warn('no se encontraron las unidades')
                return { status: 'empty' }
            }
            log.info('ubicaciones obtenidas correctamente')
            return { status: 'ok', data: unidades };

        } catch (error) {
            log.error({ err: error }, 'error al obtener las unidades')
            return { status: 'error', message: 'error al obtener todas las unidades' }
        }

    },
}