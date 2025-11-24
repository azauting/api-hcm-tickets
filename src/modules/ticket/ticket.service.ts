import type { Ticket, TicketCreateDTO, TicketDetalleObservacion, TipoEstado, TipoEvento, TipoOrigen, TipoPrioridad, TipoUnidad, Ubicacion, TicketDetalle, TicketFinalAnswer } from '../../utils/interfaces';
import type { ResultSetHeader } from 'mysql2';
import pool from '../../config/db.config';
import { logger } from '../../utils/logger';
import type { CreateTicketResult, GetTicketResult, GetTicketsType, CancelTicketResult, ApiResponse } from '../../utils/types';
import type { RowDataPacket } from 'mysql2';
const log = logger.child({ service: 'ticketService' });
import { ticketLogService } from '../ticketLog/ticketLog.service';



export const ticketService = {
    createTicket: async (ticketObjeto: TicketCreateDTO): Promise<CreateTicketResult> => {
        log.info({ action: 'createTicketService', usuario_id_solicita: ticketObjeto.usuario_id_solicita }, 'Recibiendo datos del controller nuevo ticket');
        // primera parte, crea el ticket
        try {
            const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO ticket 
                    (usuario_id_solicita, asunto, descripcion, telefono, autor_problema, ubicacion_id, direccion_ip, estado_de_revision, prioridad_id, unidad_id, estado_id, origen_id, evento_id) 
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
                    ticketObjeto.prioridad_id,
                    ticketObjeto.unidad_id,
                    ticketObjeto.estado_id,
                    ticketObjeto.origen_id,
                    ticketObjeto.evento_id,
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
    createTicketDetail: async (ticketId: number): Promise<ApiResponse<TicketDetalle>> => {
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
    closeTicket: async (ticketId: number, respuestaFinal: string, usuario_id: number): Promise<ApiResponse<TicketFinalAnswer>> => {
        try {
            // 1. actualizar el ticket con estado_id = 5 (CERRADO), y agregar la respuesta en ticket detalle
            const [updateResult] = await pool.query<ResultSetHeader>(
                `UPDATE ticket t
                JOIN ticket_detalle td ON t.ticket_id = td.ticket_id
                SET t.estado_id = 5, td.respuesta = ?
                WHERE t.ticket_id = ?`,
                [respuestaFinal, ticketId]
            );

            return { status: 'ok', data: [{ ticket_id: ticketId, respuesta_final: respuestaFinal }] };
        } catch (error) {
            log.error({ error, ticketId, usuario_id }, 'Error al cerrar el ticket');
            return { status: 'error', message: 'Error al cerrar el ticket' };
        }
    },
    addTicketObservation: async (ticketId: number, observacion: string, userId: number): Promise<ApiResponse<TicketDetalleObservacion>> => {

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
    deleteFullTicket: async (ticketId: number): Promise<void> => {
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
    cancelTicket: async (ticketId: number, userId: number): Promise<CancelTicketResult> => {
        try {
            // 1. OBTENER TICKET
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT ticket_id, usuario_id_solicita
                FROM ticket
                WHERE ticket_id = ?`,
                [ticketId]
            );

            const ticket = rows[0];
            if (!ticket) {
                return { status: "error", message: "Ticket no encontrado" };
            }

            // Validar creador
            if (ticket.usuario_id_solicita !== userId) {
                return { status: "forbidden", message: "No puedes cancelar un ticket que no creaste" };
            }

            // 2. OBTENER FECHA DE CREACIÓN DESDE ticket_movimiento
            // 2. Obtener fecha del primer movimiento (creación)
            const [movRows] = await pool.query<RowDataPacket[]>(
                `SELECT fecha
                    FROM ticket_movimiento
                    WHERE ticket_id = ?
                    ORDER BY fecha ASC
                    LIMIT 1`,
                [ticketId]
            );

            // Si no existe movimiento, no debería pasar, pero igual lo controlamos
            if (!ticket.fecha_creacion) {
                return {
                    status: "error",
                    message: "El ticket aún no tiene movimientos registrados"
                };
            }

            // Verificar tiempo (5 minutos)
            const fechaCreacion = new Date(ticket.fecha_creacion);
            const ahora = new Date();
            const minutos = (ahora.getTime() - fechaCreacion.getTime()) / 1000 / 60;

            if (minutos > 5) {
                return {
                    status: "tiempo expirado",
                    message: "Ya no puedes cancelar el ticket (pasaron más de 5 minutos)"
                };
            }

            // 3. ELIMINAR MOVIMIENTOS
            await pool.query(`DELETE FROM ticket_movimiento WHERE ticket_id = ?`, [ticketId]);

            // 4. ELIMINAR EL TICKET
            await pool.query(`DELETE FROM ticket WHERE ticket_id = ?`, [ticketId]);

            return { status: "ok" };

        } catch (error) {
            log.error({ error, ticketId, userId }, "Error en cancelTicketById");
            return { status: "error", message: "Error al cancelar el ticket" };
        }
    },
    getTicketById: async (ticketId: number): Promise<GetTicketResult> => {
        log.info({ action: 'getTicketById', ticketId }, 'Obteniendo ticket por ID');

        if (!ticketId || ticketId <= 0) {
            return { status: 'error', message: 'ID de ticket inválido' };
        }

        try {
            // Obtener ticket + su fecha de creación
            // join a las tablas tipo_estado, tipo_prioridad, tipo_origen, tipo_evento, ubicacion, tipo_unidad para mostrar los nombres en vez de los IDs
            const [rows] = await pool.query<Ticket[] & RowDataPacket[]>(
                `SELECT 
                    t.ticket_id,
                    t.usuario_id_solicita,
                    t.asunto,
                    t.descripcion,
                    t.telefono,
                    t.autor_problema,
                    t.direccion_ip,
                    t.estado_de_revision,
                    
                    -- valores de las tablas tipo (sin las *_id)
                    te.estado    AS estado,
                    tp.prioridad AS prioridad,
                    tu.unidad    AS unidad,
                    tor.origen   AS origen,
                    tev.evento   AS evento,
                    u.ubicacion  AS ubicacion,

                    (
                        SELECT fecha 
                        FROM ticket_movimiento tm 
                        WHERE tm.ticket_id = t.ticket_id 
                        ORDER BY fecha ASC 
                        LIMIT 1
                    ) AS fecha_creacion

                FROM ticket t
                JOIN tipo_estado    te ON t.estado_id    = te.estado_id
                JOIN tipo_prioridad tp ON t.prioridad_id = tp.prioridad_id
                JOIN tipo_unidad    tu ON t.unidad_id    = tu.unidad_id
                JOIN tipo_origen    tor ON t.origen_id   = tor.origen_id
                JOIN tipo_evento    tev ON t.evento_id   = tev.evento_id
                JOIN ubicacion      u  ON t.ubicacion_id = u.ubicacion_id
                WHERE t.ticket_id = ?;
                `,
                [ticketId]
            );

            const ticket = rows[0];
            if (!ticket) {
                return { status: 'not_found', message: 'Ticket no encontrado' };
            }

            // obtener detalle
            const [detalleRows] = await pool.query<RowDataPacket[]>(
                `SELECT * FROM ticket_detalle WHERE ticket_id = ?`,
                [ticketId]
            );

            const detalle: TicketDetalle | null = detalleRows.length > 0 ? detalleRows[0] as TicketDetalle : null;
            

            // obtener observaciones
            let observaciones: TicketDetalleObservacion[] = [];
            if (detalle) {
                const [obsRows] = await pool.query<RowDataPacket[]>(
                    `SELECT * FROM ticket_detalle_observacion WHERE ticket_detalle_id = ?`,
                    [detalle.ticket_detalle_id]
                );
                observaciones = obsRows as TicketDetalleObservacion[];
            }

            // Obtener integrantes
            let integrantes: any[] = [];
            if (detalle) {
                const [intRows] = await pool.query<RowDataPacket[]>(
                    `SELECT * FROM ticket_detalle_integrante WHERE ticket_detalle_id = ?`,
                    [detalle.ticket_detalle_id]
                );
                integrantes = intRows;
            }


            return {
                status: "ok", data: { ticket, detalle, observaciones, integrantes }
            };

        } catch (error) {
            log.error({ error, ticketId }, 'Error al obtener el ticket');
            return { status: "error", message: "Error al obtener el ticket" };
        }
    },
    getTicketsByUserId: async (userId: number, params: { page: number; limit: number; offset: number; filters: any }): Promise<GetTicketsType> => {

        const { page, limit, offset, filters } = params;

        log.info({ userId, filters, page, limit }, 'obteniendo tickets del usuario con filtros y paginación');

        try {
            const whereConditions = ["usuario_id_solicita = ?"];
            const values: any[] = [userId];

            // filtros
            if (filters.estado) {
                whereConditions.push("estado_id = ?");
                values.push(filters.estado);
            }

            if (filters.prioridad) {
                whereConditions.push("prioridad_id = ?");
                values.push(filters.prioridad);
            }

            if (filters.evento) {
                whereConditions.push("evento_id = ?");
                values.push(filters.evento);
            }

            if (filters.ubicacion) {
                whereConditions.push("ubicacion_id = ?");
                values.push(filters.ubicacion);
            }

            const whereSql = `WHERE ${whereConditions.join(" AND ")}`;

            // debemos agregar la fecha de creación del ticket desde ticket_movimiento
            // debemos hacer joins con las tablas tipo_estado, tipo_prioridad, tipo_origen, tipo_evento, ubicacion, tipo_unidad para mostrar los nombres en vez de los IDs
            const [rows] = await pool.query<Ticket[] & RowDataPacket[]>(
                `SELECT 
                    t.ticket_id,
                    t.usuario_id_solicita,
                    t.asunto,
                    t.descripcion,
                    t.telefono,
                    t.autor_problema,
                    t.direccion_ip,
                    t.estado_de_revision,

                    -- nombres de tablas tipo (sin IDs)
                    te.estado    AS estado,
                    tp.prioridad AS prioridad,
                    tu.unidad    AS unidad,
                    tor.origen   AS origen,
                    tev.evento   AS evento,
                    u.ubicacion  AS ubicacion,

                    (
                        SELECT fecha 
                        FROM ticket_movimiento tm 
                        WHERE tm.ticket_id = t.ticket_id 
                        ORDER BY fecha ASC 
                        LIMIT 1
                    ) AS fecha_creacion

                FROM ticket t
                JOIN tipo_estado    te ON t.estado_id    = te.estado_id
                JOIN tipo_prioridad tp ON t.prioridad_id = tp.prioridad_id
                JOIN tipo_origen    tor ON t.origen_id   = tor.origen_id
                JOIN tipo_evento    tev ON t.evento_id   = tev.evento_id
                JOIN ubicacion      u  ON t.ubicacion_id = u.ubicacion_id
                JOIN tipo_unidad    tu ON t.unidad_id    = tu.unidad_id

                ${whereSql}

                ORDER BY t.ticket_id DESC
                LIMIT ? OFFSET ?;
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

            return { status: 'ok', tickets, pagination: { page, limit, count: tickets.length } };

        } catch (error) {
            log.error({ error, userId }, 'error al obtener los tickets');
            return { status: 'error', message: 'error al obtener los tickets' };
        }
    },
    reviewTicket: async (ticketId: number, usuario_id: number) => {
        try {
            // actualizar estado_de_revision
            const [result] = await pool.query<ResultSetHeader>(
                `UPDATE ticket 
            SET estado_de_revision = 1
            WHERE ticket_id = ?`,
                [ticketId]
            );

            if (result.affectedRows === 0) {
                return { status: 'not_found' };
            }

            // registrar movimiento 9 = REVISADO
            await ticketLogService.createTicketLog({
                ticket_id: ticketId,
                movimiento_id: 9,
                usuario_id
            });

            return { status: 'ok' };

        } catch (error) {
            return { status: 'error' };
        }
    },
    updateTicketByAdmin: async (ticketId: number, updateData: any, usuario_id: number) => {
        log.info({ action: 'updateTicketByAdmin', ticketId, updateData, usuario_id }, 'Actualizando ticket por administrador');
        try {
            const fields = [];
            const values = [];
            for (const key in updateData) {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
            values.push(ticketId);
            const [result] = await pool.query<ResultSetHeader>(
                `UPDATE ticket SET ${fields.join(', ')} WHERE ticket_id = ?`,
                values
            );
            if (result.affectedRows === 0) {
                return { status: 'not_found' };
            }
            return { status: 'ok', updatedFields: updateData };
        } catch (error) {
            log.error({ error, ticketId, updateData, usuario_id }, 'Error al actualizar ticket por administrador');
            return { status: 'error', message: 'Error interno al actualizar ticket' };
        }
    },
    assignTicket: async (ticket_id: number, soporte_asignado: number) => {
        log.info({ action: 'assignTicket', ticket_id, soporte_asignado }, 'Asignando soporte al ticket');

        try {
            // debemos verificar que el usuario soporte no tenga un ticket asignado, porque para poder asignar un ticket, el soporte no debe tener otro ticket asignado, debemos verificar todos los tickets con su ticket_detalle y ver si el soporte_asignado es igual al usuario que queremos asignar y que el ticket no esté cerrado (estado_id != 5)
            const [assignedRows] = await pool.query<RowDataPacket[]>(
                `SELECT t.ticket_id
                FROM ticket t
                JOIN ticket_detalle td ON t.ticket_id = td.ticket_id
                WHERE td.soporte_asignado = ? AND t.estado_id != 5`,
                [soporte_asignado]
            );

            // 🔍 Obtener el detalle del ticket
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT ticket_detalle_id FROM ticket_detalle WHERE ticket_id = ?`,
                [ticket_id]
            );

            const detalle = rows[0];

            if (!detalle) {
                return {
                    status: 'not_found',
                    message: 'El ticket no tiene un detalle creado o no existe'
                };
            }

            // Actualizar el soporte asignado en ticket_detalle
            const [update] = await pool.query<ResultSetHeader>(
                `UPDATE ticket_detalle
                SET soporte_asignado = ?
                WHERE ticket_id = ?`,
                [soporte_asignado, ticket_id]
            );

            if (update.affectedRows === 0) {
                return { status: 'error', message: 'No se pudo asignar el ticket' };
            }

            return { status: 'ok', ticket_detalle_id: detalle.ticket_detalle_id, soporte_asignado };

        } catch (error) {
            log.error({ error, ticket_id, soporte_asignado }, 'Error al asignar soporte');
            return { status: 'error', message: 'Error interno al asignar soporte' };
        }
    },
    addMemberToTicket: async (ticket_id: number, usuario_id: number, usuario_id_solicitante: number) => {
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
                VALUES (?, ?)`,
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
    isSupportAssigned: async (ticketId: number, soporteId: number): Promise<boolean> => {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT td.ticket_detalle_id
                FROM ticket_detalle td
                WHERE td.ticket_id = ? AND td.soporte_asignado = ?`,
                [ticketId, soporteId]
            );

            return rows.length > 0;
        } catch (error) {
            log.error({ error, ticketId, soporteId }, "Error en isSupportAssigned");
            return false;
        }
    },
    getUnreviewedTickets: async (): Promise<ApiResponse<Ticket>> => {
        log.info({ action: 'getUnreviewedTickets' }, 'Obteniendo tickets sin revisar');
        try {
            // aca debemos mostrar la informacion del ticket donde estado_de_revision = 0, ademas con todos sus valores tipo con el valor de texto, por lo tanto hay que hacer joins con las tablas tipo_estado, tipo_prioridad, tipo_origen, tipo_evento, ubicacion, tipo_unidad
            const [rows] = await pool.query<Ticket[] & RowDataPacket[]>(
                `SELECT 
                    t.ticket_id,
                    t.usuario_id_solicita,
                    t.asunto,
                    t.descripcion,
                    t.telefono,
                    t.autor_problema,
                    t.direccion_ip,
                    t.estado_de_revision,

                    te.estado    AS estado,
                    tp.prioridad AS prioridad,
                    tor.origen   AS origen,
                    tev.evento   AS evento,
                    u.ubicacion  AS ubicacion,
                    tu.unidad    AS unidad

                FROM ticket t
                JOIN tipo_estado    te ON t.estado_id    = te.estado_id
                JOIN tipo_prioridad tp ON t.prioridad_id = tp.prioridad_id
                JOIN tipo_origen    tor ON t.origen_id   = tor.origen_id
                JOIN tipo_evento    tev ON t.evento_id   = tev.evento_id
                JOIN ubicacion      u  ON t.ubicacion_id = u.ubicacion_id
                JOIN tipo_unidad    tu ON t.unidad_id    = tu.unidad_id
                WHERE t.estado_de_revision = 0
                ORDER BY t.ticket_id DESC`
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
    getTicketsByUnit: async (unidad_id: number): Promise<ApiResponse<Ticket>> => {
        log.info({ action: 'getTicketsByUnitId', unidad_id }, 'Obteniendo tickets por unidad');
        try {
            // obtener todos los ticket de esa unidad y que tengan estado_revision = 1 (revisados)
            // ademas debemos hacer joins con las tablas tipo_estado, tipo_prioridad, tipo_origen, tipo_evento, ubicacion, tipo_unidad para mostrar los nombres en vez de los IDs
            const [rows] = await pool.query<Ticket[] & RowDataPacket[]>(
                `SELECT 
                    t.ticket_id,
                    t.usuario_id_solicita,
                    t.asunto,
                    t.descripcion,
                    t.telefono,
                    t.autor_problema,
                    t.direccion_ip,
                    t.estado_de_revision,

                    te.estado    AS estado,
                    tp.prioridad AS prioridad,
                    tor.origen   AS origen,
                    tev.evento   AS evento,
                    u.ubicacion  AS ubicacion,
                    tu.unidad    AS unidad

                FROM ticket t
                JOIN tipo_estado    te ON t.estado_id    = te.estado_id
                JOIN tipo_prioridad tp ON t.prioridad_id = tp.prioridad_id
                JOIN tipo_origen    tor ON t.origen_id   = tor.origen_id
                JOIN tipo_evento    tev ON t.evento_id   = tev.evento_id
                JOIN ubicacion      u  ON t.ubicacion_id = u.ubicacion_id
                JOIN tipo_unidad    tu ON t.unidad_id    = tu.unidad_id
                
                WHERE t.unidad_id = ? 
                AND t.estado_de_revision = 1

                ORDER BY t.ticket_id DESC`,
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
    getAllStatusTypes: async (): Promise<ApiResponse<TipoEstado>> => {
        log.info({ action: 'getAllTipoEstado' }, 'Obteniendo todos los tipos de estado');

        try {
            const [rows] = await pool.query(
                `SELECT estado_id, estado FROM tipo_estado`
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
    getAllPriorityTypes: async (): Promise<ApiResponse<TipoPrioridad>> => {
        log.info({ action: 'getAllTipoPrioridad' }, 'Obteniendo todas las prioridades');

        try {
            const [rows] = await pool.query(`
            SELECT prioridad_id, prioridad FROM tipo_prioridad; `);

            const prioridades = rows as { prioridad_id: number; prioridad: string }[];

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
    getAllOriginTypes: async (): Promise<ApiResponse<TipoOrigen>> => {
        log.info({ action: 'getAllTipoOrigen' }, 'Obteniendo todos los tipos de origen');

        try {
            const [rows] = await pool.query(
                `SELECT origen_id, origen FROM tipo_origen`
            );

            const origen = rows as { origen_id: number; origen: string }[];

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
    getAllEventTypes: async (): Promise<ApiResponse<TipoEvento>> => {
        log.info({ action: 'GetAlltipoEvento' }, 'Obteniendo todos los tipos de evento');

        try {
            const [rows] = await pool.query(
                'SELECT evento_id,evento FROM tipo_evento'
            )

            const eventos = rows as { evento_id: number; evento: string }[];

            if (!eventos.length) {
                log.warn('no se encontraron tipos de eventos')
                return { status: 'empty' }
            }

            log.info('evento obtenido correctamente')
            return { status: 'ok', data: eventos }

        } catch (error) {
            log.error({ err: error }, 'Error al obtener los tipos de evento');
            return { status: 'error', message: 'Error al obtener los tipos de evento' };
        }
    },
    getAllLocationTypes: async (): Promise<ApiResponse<Ubicacion>> => {
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
    getAllUnitTypes: async (): Promise<ApiResponse<TipoUnidad>> => {
        log.info({ action: 'GetAllUnidad' }, 'obteniendo todos los tipos de unidad')

        try {
            const [rows] = await pool.query('SELECT unidad_id, unidad FROM tipo_unidad')

            const unidades = rows as { unidad_id: number, unidad: string; }[];

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
    getAllTickets: async (): Promise<ApiResponse<Ticket>> => {
        log.info({ action: "getAllTickets" }, "Obteniendo todos los tickets");
        // obtener todos los tickets ordenados por ticket_id DESC
        // join con las tablas tipo_estado, tipo_prioridad, tipo_origen, tipo_evento, ubicacion, tipo_unidad para mostrar los nombres en vez de los IDs
        try {
            const [rows] = await pool.query<Ticket[] & RowDataPacket[]>(
                `SELECT 
                t.ticket_id,
                t.usuario_id_solicita,
                t.asunto,
                t.descripcion,
                t.telefono,
                t.autor_problema,
                t.direccion_ip,
                t.estado_de_revision,

                te.estado    AS estado,
                tp.prioridad AS prioridad,
                tor.origen   AS origen,
                tev.evento   AS evento,
                u.ubicacion  AS ubicacion,
                tu.unidad    AS unidad

            FROM ticket t
            JOIN tipo_estado    te ON t.estado_id    = te.estado_id
            JOIN tipo_prioridad tp ON t.prioridad_id = tp.prioridad_id
            JOIN tipo_origen    tor ON t.origen_id   = tor.origen_id
            JOIN tipo_evento    tev ON t.evento_id   = tev.evento_id
            JOIN ubicacion      u  ON t.ubicacion_id = u.ubicacion_id
            JOIN tipo_unidad    tu ON t.unidad_id    = tu.unidad_id

            ORDER BY t.ticket_id DESC`
            );
            const tickets = rows as Ticket[];

            if (!tickets.length) {
                return { status: "empty" };
            }

            return { status: "ok", data: tickets };

        } catch (error) {
            log.error({ error }, "Error al obtener todos los tickets");
            return {
                status: "error",
                message: "Error al obtener todos los tickets"
            };
        }
    },
    getTicketDetailsById: async (ticketId: number) => {
        try {
            // 
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT 
                ticket_detalle_id,
                ticket_id,
                respuesta,
                soporte_asignado
            FROM ticket_detalle
            WHERE ticket_id = ?`,
                [ticketId]
            );

            if (rows.length === 0) {
                return { status: "empty" };
            }

            return { status: "ok", data: rows };

        } catch (error) {
            log.error({ error, ticketId }, "Error en obtener detalle del ticket");
            return { status: "error", message: "Error al obtener detalle del ticket" };
        }
    },
    getTicketObservationsById: async (ticketId: number) => {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT 
                o.ticket_detalle_observacion_id,
                o.ticket_detalle_id,
                o.usuario_id,
                u.nombre_completo,
                o.observacion
            FROM ticket_detalle_observacion o
            JOIN ticket_detalle td ON td.ticket_detalle_id = o.ticket_detalle_id
            JOIN usuario u ON u.usuario_id = o.usuario_id
            WHERE td.ticket_id = ?
            ORDER BY o.ticket_detalle_observacion_id ASC`,
                [ticketId]
            );

            if (rows.length === 0) {
                return { status: "empty" };
            }

            return { status: "ok", data: rows };

        } catch (error) {
            log.error({ error, ticketId }, "Error en getTicketObservationsById");
            return { status: "error", message: "Error al obtener observaciones" };
        }
    },
    getTicketMembersById: async (ticketId: number) => {
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT 
                tdi.ticket_detalle_integrante_id,
                tdi.ticket_detalle_id,
                tdi.usuario_id,
                u.nombre_completo,
                u.correo,
                u.rol_id
            FROM ticket_detalle_integrante tdi
            JOIN ticket_detalle td ON td.ticket_detalle_id = tdi.ticket_detalle_id
            JOIN usuario u ON u.usuario_id = tdi.usuario_id
            WHERE td.ticket_id = ?`,
                [ticketId]
            );

            if (rows.length === 0) {
                return { status: "empty" };
            }

            return { status: "ok", data: rows };

        } catch (error) {
            log.error({ error, ticketId }, "Error en getTicketMembersById");
            return { status: "error", message: "Error al obtener integrantes" };
        }
    },
}