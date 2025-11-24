import type { Request, Response } from 'express';
import { validadorTicketForm } from '../../utils/validatorTicketForm';
import { ticketService } from './ticket.service';
import { logger } from '../../utils/logger';
import type { AuthRequest, TicketCreateDTO, TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { ticketLogController } from '../ticketLog/ticketLog.controller';

import { parseIdParam, sendResponse } from '../../utils/helper';

const log = logger.child({ ubicacion: 'ticketController' });

export const ticketController = {
    createTicket: async (req: AuthRequest, res: Response) => {
        // 1. obtener el usuario_id desde el token
        const usuario_id_solicita = req.user!.id
        log.info({ usuario_id_solicita, requestBody: req.body }, 'Recibiendo data para crear nuevo ticket');

        // 2. validar los datos del ticket
        const { isValid, message, ticket: ticketValidado } = validadorTicketForm(req.body);
        if (!isValid || !ticketValidado) {
            return sendResponse(res, 400, `Datos del ticket inválidos: ${message}`);
        }

        log.info({ usuario_id_solicita, ticketValidado }, 'Datos del ticket validados');

        // 3. preparar data
        const ticketObject: TicketCreateDTO = {
            usuario_id_solicita,
            asunto: ticketValidado.asunto,
            descripcion: ticketValidado.descripcion,
            telefono: ticketValidado.telefono,
            autor_problema: ticketValidado.autor_problema,
            ubicacion_id: ticketValidado.ubicacion_id,
            direccion_ip: req.ip!,
            estado_de_revision: 0,
            prioridad_id: 1,
            unidad_id: 1,
            estado_id: 1,
            origen_id: 1,
            evento_id: 1,
        };

        // 4. crear ticket
        const result = await ticketService.createTicket(ticketObject);
        if (result.status === 'error') {
            return sendResponse(res, 500, result.message);
        }

        const ticket_id = result.ticket_id;

        // 5. crear ticket_detalle
        const detalle = await ticketService.createTicketDetail(ticket_id);
        if (detalle.status === 'error') {
            await ticketService.deleteFullTicket(ticket_id);
            return sendResponse(res, 500, 'Error al crear ticket_detalle');
        }

        log.info({ usuario_id_solicita, ticket_id }, 'Ticket creado');

        // 6. registrar movimiento inicial
        const objetoMovimiento: TicketMovimientoCreateDTO = {
            ticket_id: ticket_id,
            movimiento_id: 1, // creación
            usuario_id: usuario_id_solicita,
        };

        const logResult = await ticketLogController.createTicketLog(objetoMovimiento);

        // ⚠️ AQUÍ ES DONDE VA EL ROLLBACK
        if (logResult.status === "error") {
            await ticketService.deleteFullTicket(ticket_id);
            return sendResponse(res, 500, "Error al registrar movimiento del ticket");
        }

        log.info({ ticket_id }, 'Log del ticket creado correctamente');

        // 7. respuesta final
        return sendResponse(res, 201, 'Ticket creado correctamente', {
            ticket_id,
            message: logResult.message
        });
    },
    closeTicket: async (req: AuthRequest, res: Response) => {
        try {
            const ticketId = parseIdParam(req.params.id);

            if (ticketId === null) {
                return sendResponse(res, 400, "El parámetro 'id' es inválido o no es numérico");
            }

            const userId = req.user!.id;
            const userRole = req.user!.nombre_rol;

            const result = await ticketService.closeTicket(ticketId, userId, userRole);

            if (result.status !== 'ok') {
                return sendResponse(res, 400, result.message ?? "No se pudo cerrar el ticket");
            }

            return sendResponse(res, 200, "Ticket cerrado correctamente", {
                ticket_id: ticketId
            });

        } catch (error) {
            log.error({ error }, "Error en closeTicket");
            return sendResponse(res, 500, "Error al cerrar el ticket");
        }
    },

    updateTicketAdminReview: async (req: AuthRequest, res: Response) => {
        const ticketId = parseIdParam(req.params.id);
        const usuario_id = req.user!.id;

        // validar id
        if (ticketId === null) {
            return sendResponse(res, 400, "ID de ticket inválido");
        }

        // llamar al service
        const result = await ticketService.reviewTicket(ticketId, usuario_id);

        if (result.status === 'not_found') {
            return sendResponse(res, 404, "Ticket no encontrado");
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, "Error al marcar ticket como revisado");
        }

        return sendResponse(res, 200, "Ticket marcado como revisado");
    },

    assignTicket: async (req: AuthRequest, res: Response) => {
        const ticketId = parseIdParam(req.params.id);
        const usuario_id = req.user!.id;
        const rol = req.user!.nombre_rol;

        if (ticketId === null) {
            return sendResponse(res, 400, "ID de ticket inválido para asignación");
        }


        let soporteAsignado: number;

        if (rol === 'administrador') {
            const { soporte_id } = req.body;
            soporteAsignado = soporte_id  // autoasignar si no envía otro id
        } else if (rol === 'soporte') {
            soporteAsignado = usuario_id; // solo autasignación
        } else {
            return sendResponse(res, 403, 'No tienes permisos para asignar tickets');
        }

        const result = await ticketService.assignTicket(ticketId, soporteAsignado);

        if (result.status === 'not_found') {
            return sendResponse(res, 404, result.message ?? 'Ticket no encontrado');
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message ?? 'Error al asignar ticket');
        }

        await ticketLogController.createTicketLog({
            ticket_id: ticketId,
            movimiento_id: 3,
            usuario_id
        });

        return sendResponse(res, 200, 'Ticket asignado correctamente', {
            ticket_detalle_id: result.ticket_detalle_id,
            soporte_asignado: soporteAsignado
        });
    },
    getTicketById: async (req: AuthRequest, res: Response) => {
        const ticketId = parseIdParam(req.params.id);

        if (ticketId === null) {
            return sendResponse(res, 400, "ID de ticket inválido para obtener detalles");
        }

        const result = await ticketService.getTicketById(ticketId);

        if (result.status === "not_found") {
            return sendResponse(res, 404, result.message);
        }

        if (result.status === "error") {
            return sendResponse(res, 500, result.message);
        }

        const ticket = result.data.ticket;
        
        const role = req.user!.nombre_rol;
        const userId = req.user!.id;

        // Seguridad por rol
        const isAssigned = await ticketService.isSupportAssigned(ticketId, userId);

        //ver ticket, admin,solicitante que lo creo, y soporte asignado al ticket
        if (role !== "administrador" &&ticket.usuario_id_solicita !== userId &&!isAssigned) {
            return sendResponse(res, 403, "No tienes permiso para ver este ticket");
        }
        return sendResponse(res, 200, "Ticket obtenido correctamente", { ticket: result.data });
    },
    getAllTickets: async (req: AuthRequest, res: Response) => {
        const role = req.user!.nombre_rol;

        // Solo admin puede ver todos los tickets
        if (role !== 'administrador') {
            return sendResponse(res, 403, "No autorizado para ver todos los tickets");
        }

        const result = await ticketService.getAllTickets();

        if (result.status === "empty") {
            return sendResponse(res, 404, "No se encontraron tickets registrados");
        }

        if (result.status === "error") {
            return sendResponse(res, 500, result.message);
        }

        return sendResponse(res, 200, "Tickets obtenidos correctamente", { tickets: result.data });
    },
    addTicketObservation: async (req: AuthRequest, res: Response) => {
        const ticketId = parseIdParam(req.params.id);
        const userId = req.user!.id;
        const { observacion } = req.body;

        if (!observacion || typeof observacion !== 'string') {
            return sendResponse(res, 400, 'La observación es requerida');
        }

        const result = await ticketService.addTicketObservation(ticketId, observacion, userId);

        if (result.status === 'empty') {
            return sendResponse(res, 404, 'El ticket no tiene un detalle asociado');
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message);
        }

        // REGISTRAR EL MOVIMIENTO CORRECTO "COMENTARIO_AGREGADO"(ID = 7)
        await ticketLogController.createTicketLog({
            ticket_id: ticketId,
            movimiento_id: 7,
            usuario_id: userId
        });

        return sendResponse(res, 200, 'Observación agregada correctamente', result.data[0]
        );
    },
    cancelTicket: async (req: AuthRequest, res: Response) => {
        const ticketId = parseIdParam(req.params.id);
        const userId = req.user!.id;

        log.info({ ticketId, userId }, 'Solicitando cancelación del ticket');

        if (ticketId === null) {
            return sendResponse(res, 400, "ID de ticket inválido para cancelación");
        }



        const result = await ticketService.cancelTicket(ticketId, userId);

        // forbidden es para cuando el usuario no es el creador del ticket
        if (result.status === 'forbidden') {
            return sendResponse(res, 403, result.message);
        }

        if (result.status === 'tiempo expirado') {
            return sendResponse(res, 400, result.message);
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message || 'Error al cancelar ticket');
        }
        await ticketLogController.createTicketLog({
            ticket_id: ticketId,
            movimiento_id: 11,
            usuario_id: userId
        });


        return sendResponse(res, 200, 'Ticket cancelado correctamente');
    },
    getTicketsByUserId: async (req: AuthRequest, res: Response) => {

        const userId = req.user!.id;
        log.info({ userId }, 'obteniendo tickets del usuario');

        // numeracion de paginas (cuanto queremos mostrar por pagina)
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // filtros para los tickets
        const filters = {
            estado: req.query.estado ? Number(req.query.estado) : undefined, //para usuario
            prioridad: req.query.prioridad ? Number(req.query.prioridad) : undefined, //para usuario
            evento: req.query.evento ? Number(req.query.evento) : undefined, //admin
            ubicacion: req.query.ubicacion ? Number(req.query.ubicacion) : undefined, //admin
        }

        const result = await ticketService.getTicketsByUserId(userId, { page, limit, offset, filters });

        if (result.status === 'empty') {

            return sendResponse(res, 404, 'No se encontraron tickets para el usuario')
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        return sendResponse(res, 200, 'Tickets obtenidos correctamente', { tickets: result.tickets });
    },
    addTicketMember: async (req: AuthRequest, res: Response) => {
        const ticketId = parseIdParam(req.params.id);
        const usuario_id_solicitante = req.user!.id;
        const usuario_id = req.body.usuario_id;

        if (ticketId === null) {
            return sendResponse(res, 400, "ID de ticket inválido para agregar integrante");
        }

        if (!usuario_id || typeof usuario_id !== 'number' || usuario_id <= 0) {
            return sendResponse(res, 400, 'ID de usuario inválido');
        }

        const result = await ticketService.addMemberToTicket(ticketId, usuario_id, usuario_id_solicitante);

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message ?? 'Error al agregar integrante');
        }

        if (result.status === 'not_found') {
            return sendResponse(res, 404, result.message ?? 'Ticket no encontrado');
        }

        // 🔥 REGISTRO DEL MOVIMIENTO "INTEGRANTE_AGREGADO" (ID = 15)
        const objetoMovimiento: TicketMovimientoCreateDTO = {
            ticket_id: ticketId,
            movimiento_id: 15,
            usuario_id: usuario_id_solicitante,
        };

        await ticketLogController.createTicketLog(objetoMovimiento);

        return sendResponse(res, 200, 'Integrante agregado correctamente', { ticket_detalle_integrante_id: result.ticket_detalle_integrante_id });
    },
    
    getUnreviewedTickets: async (req: AuthRequest, res: Response) => {
        log.info('Obteniendo tickets sin revisar');
        const result = await ticketService.getUnreviewedTickets();
        if (result.status === 'empty') {
            return sendResponse(res, 404, 'No se encontraron tickets sin revisar');
        }
        if (result.status === 'error') {
            return sendResponse(res, 500, result.message);
        }
        return sendResponse(res, 200, 'Tickets sin revisar obtenidos correctamente', { tickets: result.data });
    },
    getTicketsByUnit: async (req: AuthRequest, res: Response) => {
        // primero obtenemos la info del token
        const usuario_id = req.user!.id;
        const unidad = req.user!.unidad

        if (!unidad) {
            return sendResponse(res, 400, 'El usuario no tiene una unidad asignada');
        }
        log.info({ usuario_id, unidad }, 'Obteniendo tickets por unidad');

        // independiente el rol, si el administrador es unidad soporte, obtiene todos los tickets de la unidad soporte
        try {

            if (unidad === 'soporte') {
                const unidad_id = 1
                const result = await ticketService.getTicketsByUnit(unidad_id);

                if (result.status === 'empty') {
                    return sendResponse(res, 404, 'No se encontraron tickets para la unidad soporte');
                }
                if (result.status === 'error') {
                    return sendResponse(res, 500, result.message);
                }
                return sendResponse(res, 200, 'Tickets de la unidad soporte obtenidos correctamente', { tickets: result.data });
            }
            if (unidad === 'infraestructura') {
                const unidad_id = 2
                const result = await ticketService.getTicketsByUnit(unidad_id);
                if (result.status === 'empty') {
                    return sendResponse(res, 404, 'No se encontraron tickets para la unidad infraestructura');
                }
                if (result.status === 'error') {
                    return sendResponse(res, 500, result.message);
                }
                return sendResponse(res, 200, 'Tickets de la unidad infraestructura obtenidos correctamente', { tickets: result.data });
            }
            if (unidad === 'desarrollo') {
                const unidad_id = 3
                const result = await ticketService.getTicketsByUnit(unidad_id);
                if (result.status === 'empty') {
                    return sendResponse(res, 404, 'No se encontraron tickets para la unidad desarrollo');
                }
                if (result.status === 'error') {
                    return sendResponse(res, 500, result.message);
                }
                return sendResponse(res, 200, 'Tickets de la unidad desarrollo obtenidos correctamente', { tickets: result.data });
            }
        } catch (error) {
            log.error({ error }, 'Error al obtener tickets por unidad');
            return sendResponse(res, 500, 'Error al obtener tickets por unidad');
        }
    },
    getStatusType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllStatusTypes();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de estado registrados");
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, "error al obtener los tipos de estado");
        }


        return sendResponse(res, 200, "Tipos de estado obtenidos correctamente", { estados: result.data });
    },
    getPriorityType: async (req: Request, res: Response) => {

        const result = await ticketService.getAllPriorityTypes();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de prioridad")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, "error al obtener los tipos de prioridad")
        }

        return sendResponse(res, 200, "tipos de prioridad obtenidos correctamente", { prioridades: result.data })
    },
    getOriginType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllOriginTypes();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de origen")
        }

        if (result.status === 'error') {

            return sendResponse(res, 500, "error al obtener los tipos de origen")

        }
        return sendResponse(res, 200, "tipos de origen obtenidos correctamente", { origen: result.data })
    },
    getEventType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllEventTypes();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de eventos")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        return sendResponse(res, 200, "tipos de eventos obtenidos correctamente", { eventos: result.data });
    },
    getLocationType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllLocationTypes();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron las ubicaciones")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        return sendResponse(res, 200, 'ubicaciones obtenidas correctamente', { ubicaciones: result.data });
    },
    getUnityType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllUnitTypes();

        if (result.status === 'empty') {

            return sendResponse(res, 404, "no se encontraron tipos de unidad")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }


        return sendResponse(res, 200, 'Tipos de unidad obtenidos correctamente', { unidades: result.data });
    },
    getTicketDetailsById: async (req: AuthRequest, res: Response) => {
        try {
            const ticketId = parseIdParam(req.params.id);

            if (ticketId === null) {
                return sendResponse(res, 400, "ID de ticket inválido para obtener detalle");
            }

            const detalle = await ticketService.getTicketDetailsById(ticketId);

            if (detalle.status !== "ok" || !detalle.data || detalle.data.length === 0) {
                return sendResponse(res, 404, "No se encontró detalle para el ticket");
            }

            return sendResponse(res, 200, "Detalle obtenido correctamente", { detalle: detalle.data });

        } catch (error) {
            log.error({ error }, "Error en getTicketDetailsById");
            return sendResponse(res, 500, "Error al obtener el detalle del ticket");
        }
    },
    getTicketObservationsById: async (req: AuthRequest, res: Response) => {
        try {
            const ticketId = parseIdParam(req.params.id);

            if (ticketId === null) {
                return sendResponse(res, 400, "ID de ticket inválido para obtener observaciones");
            }


            const observaciones = await ticketService.getTicketObservationsById(ticketId);

            if (observaciones.status !== "ok" || !observaciones.data || observaciones.data.length === 0) {
                return sendResponse(res, 404, "No se encontraron observaciones para este ticket");
            }

            return sendResponse(res, 200, "Observaciones obtenidas correctamente", { observaciones: observaciones.data });


        } catch (error) {
            log.error({ error }, "Error en getTicketObservationsById");
            return sendResponse(res, 500, "Error al obtener las observaciones del ticket");
        }
    },
    getTicketMembersById: async (req: AuthRequest, res: Response) => {
        try {
            const ticketId = parseIdParam(req.params.id);

            if (ticketId === null) {
                return sendResponse(res, 400, "ID de ticket inválido para obtener integrantes");
            }


            const integrantes = await ticketService.getTicketMembersById(ticketId);

            if (integrantes.status !== "ok" || !integrantes.data || integrantes.data.length === 0) {
                return sendResponse(res, 404, "No se encontraron integrantes para este ticket");
            }

            return sendResponse(res, 200, "Integrantes obtenidos correctamente", { integrantes: integrantes.data });


        } catch (error) {
            log.error({ error }, "Error en getTicketMembersById");
            return sendResponse(res, 500, "Error al obtener los integrantes del ticket");
        }
    },

}





