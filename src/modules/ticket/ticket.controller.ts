import type { Request, Response } from 'express';
import type { AuthRequest } from '../../utils/interfaces';
import { validadorTicketForm } from '../../utils/validatorTicketForm';
import { ticketService } from './ticket.service';
import { logger } from '../../utils/logger';
import type { TicketCreateDTO, ticketDetalleAsignar } from '../../utils/interfaces';
import { ticketLogController } from '../ticketLog/ticketLog.controller';
import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { parseIdParam, sendResponse } from '../../utils/helper';

const log = logger.child({ ubicacion: 'ticketController' });

export const ticketController = {

    // TODO: Controladores completos
    createTicket: async (req: AuthRequest, res: Response) => {
        // 1. obtener el usuario_id desde el token
        const usuario_id_solicita = req.user!.id
        log.info({ usuario_id_solicita, requestBody: req.body }, 'Recibiendo data para crear nuevo ticket');
        // 2.  validar los datos del ticket
        const { isValid, message, ticket: ticketValidado } = validadorTicketForm(req.body);
        // Si no es valido retorna un error
        if (!isValid || !ticketValidado) {
            return sendResponse(res, 400, `Datos del ticket inválidos: ${message}`);
        }
        // Si es valido, continua el proceso
        log.info({ usuario_id_solicita, ticketValidado }, 'Datos del ticket validados');
        // 3. preparar el objeto del nuevo ticket

        // Antes de preparar el objeto debemos obtener la direccion IP del usuario

        const ticketObject: TicketCreateDTO = {
            usuario_id_solicita, // id del usuario que solicita el ticket
            asunto: ticketValidado.asunto, // asunto del ticket
            descripcion: ticketValidado.descripcion, // descripcion del problema
            telefono: ticketValidado.telefono, // telefono de contacto
            autor_problema: ticketValidado.autor_problema, // quien reporta el problema
            ubicacion_id: ticketValidado.ubicacion_id, // todo: crear las ubicaciones
            direccion_ip: req.ip!, // obtener la IP del request
            estado_de_revision: 0, // por defecto en 0, cuando un admin revise el ticket se pone en 1
            tipo_prioridad_id: 1, // por defecto en baja
            tipo_unidad_id: 1, // por defecto en soporte
            tipo_estado_id: 1, // por defecto en abierto
            tipo_origen_id: 1, // revisar aqui
            tipo_evento_id: 1, // revisar aqui
        };
        // cuarto paso, enviar el ticket al service para crear el ticket
        const result = await ticketService.createTicket(ticketObject);

        // quinto paso, manejar los posibles resultados
        if (result.status === 'error') {
            return sendResponse(res, 500, result.message);
        }

        // sexto paso, obtener el id del ticket creado y registrar el movimiento en la auditoria
        const ticket_id = result.ticket_id;
        // crear ticket_detalle automáticamente
        const detalle = await ticketService.createTicketDetalle(ticket_id);

        // si hay un error al crear el ticket detalle, eliminamos el ticket automáticamente
        if (detalle.status === 'error') {
            await ticketService.deleteTicketCompleto(ticket_id);
            return sendResponse(res, 500, 'Error al crear ticket_detalle');
        }


        log.info({ usuario_id_solicita, ticket_id }, 'Ticket creado');

        // séptimo paso, registrar el movimiento en la auditoria
        const objetoMovimiento: TicketMovimientoCreateDTO = {
            ticket_id: ticket_id, // id del ticket creado
            tipo_movimiento_id: 1, // 1 = creación de ticket
            usuario_id: usuario_id_solicita // id del usuario que crea el ticket
        };
        // octavo paso, llamar al controlador de ticket log para crear el movimiento
        const logResult = await ticketLogController.createTicketLog(objetoMovimiento);
        // si todo sale bien
        log.info({ ticket_id }, 'Log del ticket creado correctamente');
        // décimo paso, retornar respuesta exitosa
        return sendResponse(res, 201, 'Ticket creado correctamente', { ticket_id, message: logResult.message });
    },
    updateTicketAdmin: async (req: AuthRequest, res: Response) => {
        // obtenemos el id del ticket desde los parametros
        const ticketId = Number(req.params.id);
        // obtenemos el id del usuario desde el token para el ticket_movimiento
        const usuario_id = req.user!.id;
        // obtenemos los campos a actualizar desde el body
        const updateData = req.body;
        log.info({ ticketId, updateData }, 'Recibiendo data para actualizar ticket');
        // en el middleware checkRole['administrador'] ya se valida que el usuario es admin
        // verificamos el id del ticket
        if (!ticketId || ticketId <= 0) {
            return sendResponse(res, 400, 'ID de ticket inválido');
        }
        // llamamos al servicio para actualizar el ticket
        const result = await ticketService.updateTicketAdmin(ticketId, updateData);

        if (result.status === 'not_found') {
            return sendResponse(res, 404, result.message!);
        }
        if (result.status === 'error') {
            return sendResponse(res, 500, result.message!);
        }
        // luego de actualizar el ticket, registramos el movimiento en la auditoria
        const objetoMovimiento: TicketMovimientoCreateDTO = {
            ticket_id: ticketId,
            tipo_movimiento_id: 9, // ticket revisado y actualizado por admin // estos codigos de movimiento pueden cambiar en el futuro
            usuario_id: usuario_id,
        };
        const logResult = await ticketLogController.createTicketLog(objetoMovimiento);
        log.info({ ticketId }, 'Log del ticket actualizado correctamente');

        return sendResponse(res, 200, 'Ticket actualizado correctamente', { message: logResult.message });
    },
    assignTicket: async (req: AuthRequest, res: Response) => {
        const ticketId = Number(req.params.id);
        const usuario_id = req.user!.id;
        const rol = req.user!.tipo_rol;

        if (!ticketId || ticketId <= 0) {
            return sendResponse(res, 400, 'ID de ticket inválido');
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
            tipo_movimiento_id: 3,
            usuario_id
        });

        return sendResponse(res, 200, 'Ticket asignado correctamente', {
            ticket_detalle_id: result.ticket_detalle_id,
            soporte_asignado: soporteAsignado
        });
    },

    getTicketById: async (req: AuthRequest, res: Response) => {
        const ticketId = Number(req.params.id);
        const userId = req.user!.id;
        const userRole = req.user!.tipo_rol;

        log.info({ ticketId, userId, userRole }, 'obteniendo ticket por ID');

        if (!ticketId || ticketId <= 0) {
            return sendResponse(res, 400, 'ID de ticket inválido');
        }

        const result = await ticketService.getTicketId(ticketId);

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message);
        }

        if (result.status === 'not_found') {
            return sendResponse(res, 404, result.message);
        }

        const ticket = result.ticket;

        // si es solicitante no es el usuario que creo el ticket, no puede verlo
        if (userRole === "solicitante" && ticket.usuario_id_solicita !== userId) {
            return sendResponse(res, 403, 'No tienes permiso para ver este ticket');
        }

        // si es solicitante, mostramos solo ciertos campos
        let filteredTicket: any = ticket;

        if (userRole === "solicitante") {
            filteredTicket = {
                ticket_id: ticket.ticket_id,
                asunto: ticket.asunto,
                descripcion: ticket.descripcion,
                estado: ticket.tipo_estado_id,
                prioridad: ticket.tipo_prioridad_id,
                ubicacion: ticket.ubicacion_id
            };
        }
        return sendResponse(res, 200, 'Ticket obtenido correctamente', { ticket: filteredTicket });
    },
    addTicketObservation: async (req: AuthRequest, res: Response) => {
        const ticketId = Number(req.params.id);
        const userId = req.user!.id;
        const { observacion } = req.body;

        if (!observacion || typeof observacion !== 'string') {
            return sendResponse(res, 400, 'La observación es requerida');
        }

        const result = await ticketService.ticketObservation(ticketId, observacion, userId);

        if (result.status === 'empty') {
            return sendResponse(res, 404, 'El ticket no tiene un detalle asociado');
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message);
        }

        // REGISTRAR EL MOVIMIENTO CORRECTO "COMENTARIO_AGREGADO"(ID = 7)
        await ticketLogController.createTicketLog({
            ticket_id: ticketId,
            tipo_movimiento_id: 7,
            usuario_id: userId
        });

        return sendResponse(res, 200, 'Observación agregada correctamente', result.data[0]
        );
    },

    cancelTicket: async (req: AuthRequest, res: Response) => {
        const ticketId = Number(req.params.id);
        const userId = req.user!.id;

        log.info({ ticketId, userId }, 'Solicitando cancelación del ticket');

        if (!ticketId || ticketId <= 0) {
            return sendResponse(res, 400, 'ID de ticket inválido');
        }


        const result = await ticketService.cancelTicketById(ticketId, userId);

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

        const result = await ticketService.getAllTicketByUserId(userId, { page, limit, offset, filters });

        if (result.status === 'empty') {

            return sendResponse(res, 404, 'No se encontraron tickets para el usuario')
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        return sendResponse(res, 200, 'Tickets obtenidos correctamente', { tickets: result.tickets });
    },

    // TODO: Controladores en desarrollo
    // TODO: controlador para agregar integrante al ticket - estado: (falta revisar)
    // ! FALTA REVISAR
    addTicketMember: async (req: AuthRequest, res: Response) => {
        const ticketId = parseIdParam(req.params.id);
        const usuario_id_solicitante = req.user!.id;
        const usuario_id = req.body.usuario_id;

        if (ticketId === null) {
            return sendResponse(res, 400, 'ID de ticket inválido');
        }

        if (!usuario_id || typeof usuario_id !== 'number' || usuario_id <= 0) {
            return sendResponse(res, 400, 'ID de usuario inválido');
        }

        const result = await ticketService.addTicketMember(ticketId, usuario_id, usuario_id_solicitante);

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message ?? 'Error al agregar integrante');
        }

        if (result.status === 'not_found') {
            return sendResponse(res, 404, result.message ?? 'Ticket no encontrado');
        }

        // 🔥 REGISTRO DEL MOVIMIENTO "INTEGRANTE_AGREGADO" (ID = 15)
        const objetoMovimiento: TicketMovimientoCreateDTO = {
            ticket_id: ticketId,
            tipo_movimiento_id: 15,
            usuario_id: usuario_id_solicitante,
        };

        await ticketLogController.createTicketLog(objetoMovimiento);

        return sendResponse(res, 200, 'Integrante agregado correctamente', { ticket_detalle_integrante_id: result.ticket_detalle_integrante_id });
    },

    // TODO: controlador para que el soporte o admin actualice el ticket - estado: (falta revisar)
    // ! FALTA REVISAR
    updateTicketSupport: async (req: AuthRequest, res: Response) => {
        const ticketId = parseIdParam(req.params.id);
        const usuario_id = req.user!.id;
        const role = req.user!.tipo_rol;
        const body = req.body;

        if (ticketId === null) {
            return sendResponse(res, 400, 'ID de ticket inválido');
        }

        // 1️alidar que el soporte esté asignado
        if (role === "soporte") {
            const assigned = await ticketService.isSupportAssigned(ticketId, usuario_id);
            if (!assigned) {
                return sendResponse(res, 403, "No puedes modificar un ticket que no tienes asignado");
            }
        }

        // 2️⃣ Llamar al servicio
        const result = await ticketService.updateTicketSupport(ticketId, body);

        if (result.status === 'not_found') {
            return sendResponse(res, 404, result.message ?? 'Ticket no encontrado');
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message ?? 'Error al actualizar el ticket');
        }

        // 3️⃣ Registrar movimiento (ID = 10)
        await ticketLogController.createTicketLog({
            ticket_id: ticketId,
            tipo_movimiento_id: 4, // respondido por soporte y cerrado
            usuario_id,
        });

        return sendResponse(res, 200, 'Ticket actualizado correctamente', {
            cambios: result.cambios
        });
    },

    // TODO: controlador para obtener los tickets sin revisar - estado: (falta revisar)
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
    // TODO: controlador para obtener los tickets por unidad - estado: (falta revisar)
    // ! FALTA REVISAR (desarrollar)
    getTicketsByUnitId: async (req: AuthRequest, res: Response) => {
        const unidadId = parseIdParam(req.params.unidad_id);
        if (unidadId === null) {
            return sendResponse(res, 400, 'ID de unidad inválido');
        }
        const result = await ticketService.getTicketsByUnitId(unidadId);
        if (result.status === 'empty') {
            return sendResponse(res, 404, 'No se encontraron tickets para la unidad especificada');
        }
        if (result.status === 'error') {
            return sendResponse(res, 500, result.message);
        }
        return sendResponse(res, 200, 'Tickets obtenidos correctamente', { result: result.data });
    },
    // TODO: controlador para obtener los tipos - estado: ✅
    getStatusType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllTipoEstado();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de estado registrados");
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, "error al obtener los tipos de estado");
        }


        return sendResponse(res, 200, "Tipos de estado obtenidos correctamente", { estados: result.data });
    },
    getPriorityType: async (req: Request, res: Response) => {

        const result = await ticketService.getAllTipoPrioridad();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de prioridad")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, "error al obtener los tipos de prioridad")
        }

        return sendResponse(res, 200, "tipos de prioridad obtenidos correctamente", { prioridades: result.data })
    },
    getOriginType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllTipoOrigen();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de origen")
        }

        if (result.status === 'error') {

            return sendResponse(res, 500, "error al obtener los tipos de origen")

        }
        return sendResponse(res, 200, "tipos de origen obtenidos correctamente", { origen: result.data })
    },
    getEventType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllTipoEvento();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de eventos")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        return sendResponse(res, 200, "tipos de eventos obtenidos correctamente", { eventos: result.data });
    },
    getLocationType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllUbicacion();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron las ubicaciones")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        return sendResponse(res, 200, 'ubicaciones obtenidas correctamente', { ubicaciones: result.data });
    },
    getUnityType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllUnidad();

        if (result.status === 'empty') {

            return sendResponse(res, 404, "no se encontraron tipos de unidad")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }


        return sendResponse(res, 200, 'Tipos de unidad obtenidos correctamente', { unidades: result.data });
    },
}





/* EN CONSTRUCCION */

// metodo para obtener todos los tipos
/*const getTicketTypes = async (req: Request, res: Response) => {
    const type = req.params.type;
    const result = await ticketService.getAllTicketTypes();
    if (result.status === 'error') {
        return res.status(500).json({ message: result.message });
    }
    if (result.status === 'empty') {
        return res.status(404).json({ message: 'No se encontraron tipos de ticket' });
    }
    return res.status(200).json({
        message: 'Tipos de ticket obtenidos correctamente',
        data: result.tipos,
    });
}; */


