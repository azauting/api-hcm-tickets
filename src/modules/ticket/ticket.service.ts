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
    GetUnityType
} from '../../utils/types';
import { ticketLogController } from '../ticketLog/ticketLog.controller';
import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';

const log = logger.child({ service: 'ticketService' });



export const ticketService = {
    createTicket: async (ticketObjeto: TicketCreateDTO): Promise<CreateTicketResult> => {
        log.info({ action: 'createTicket', usuario_id_solicita: ticketObjeto.usuario_id_solicita }, 'Creando nuevo ticket');
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
            log.info({ ticket_id: insertedId }, 'Ticket creado correctamente');
            // crear movimiento (llama al servicio directamente, NO al controlador)
            const objetoMovimiento: TicketMovimientoCreateDTO = {
                ticket_id: insertedId,
                tipo_movimiento_id: 1,
                usuario_id: ticketObjeto.usuario_id_solicita
            }
            const logResult = await ticketLogController.createTicketLog(objetoMovimiento);

            if (logResult.status === 'error') {
                log.error({ ticket_id: insertedId }, 'Error al crear el log del ticket')
                // revertimos el ticket creado
                await pool.query(`DELETE FROM ticket WHERE ticket_id = ?`, [insertedId]);
                return { status: 'error', message: 'Error al crear el log del ticket, ticket revertido' };
            } else {
                log.info({ ticket_id: insertedId }, 'Log del ticket creado correctamente');
            }

            return { status: 'ok', ticket_id: insertedId };
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
            return { status: 'ok', priorities: prioridades };
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

    }


};