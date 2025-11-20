import type { Request, Response } from 'express';
import type { AuthRequest } from '../../utils/interfaces';
import { validadorTicketForm } from '../../utils/validatorTicketForm';
import { ticketService } from './ticket.service';
import { logger } from '../../utils/logger';
import type { TicketCreateDTO } from '../../utils/interfaces';
import { ticketLogController } from '../ticketLog/ticketLog.controller';
import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { parseIdParam, sendResponse } from '../../utils/helper';

const log = logger.child({ ubicacion: 'ticketController' });

export const ticketController = {
    // check: controller para crear un ticket - terminado
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
    // ruta para revisar y editar un ticket por id
    // el usuario solicitante no puede editar el ticket despues de crearlo
    // el administrador puede cambiar cualquier campo del ticket
    // el caso de uso para un administrador es revisar un ticket para cambiar estado/pioridad/unidad y estado_revision = 1, por defecto en = 0
    // luego asignarselo un soporte encargado o dejarlo sin asignar
    updateTicketAdmin: async (req: AuthRequest, res: Response) => {
        // obtenemos el id del ticket desde los parametros
        const ticketId = Number(req.params.id);
        // obtenemos el id del usuario desde el token para el ticket_movimiento
        const usuario_id = req.user!.id;
        // obtenemos los campos a actualizar desde el body
        const updateData = req.body;
        log.info({ ticketId, updateData }, 'Recibiendo data para actualizar ticket');
        // en el middleware checkRole['administrador'] ya se valida que el usuario es admin
        // por lo tanto puede actualizar cualquier campo del ticket
        // obtenemos los campos que se van a actualizar desde el body
        // verificamos el id del ticket
        if (!ticketId || ticketId <= 0) {
            return sendResponse(res, 400, 'ID de ticket inválido');
        }
        // llamamos al servicio para actualizar el ticket
        const result = await ticketService.updateTicketById(ticketId, updateData);

        if (result.status === 'not_found') {
            return sendResponse(res, 404, result.message);
        }
        if (result.status === 'error') {
            return sendResponse(res, 500, result.message);
        }
        return sendResponse(res, 200, 'Ticket actualizado correctamente');
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
    // check: controller para obtener mis tickets - en desarrollo
    getMyTickets: async (req: AuthRequest, res: Response) => {
        const userId = req.user!.id;
        log.info({ userId }, 'obteniendo tickets del usuario');
    },
};





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


// controller tipos
/*
    // metodo para obtener todos los tipos de estado
    getStatusType: async (req: Request, res: Response) => {

        const result = await ticketService.getAllTipoEstado();

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de estado registrados")
        }


        return sendResponse(res, 200, "tipos de estado obtenidos correctamente", { estados: result.estados })
    },
    //metodos para obtener todos los tipos de prioridad
    getPriorityType: async (req: Request, res: Response) => {

        const result = await ticketService.getAllTipoPrioridad();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de prioridad")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, "error al obtener los tipos de prioridad")
        }

        return sendResponse(res, 200, "tipos de prioridad obtenidos correctamente", { prioiridades: result.prioridades })

    },
    // metodo para obtener todos los tipos de origen
    getOriginType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllTipoOrigen();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de origen")
        }

        if (result.status === 'error') {

            return sendResponse(res, 500, "error al obtener los tipos de origen")

        }


        return sendResponse(res, 200, "tipos de origen obtenidos correctamente", { origen: result.origen })
    },

    getEventType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllTipoEvento();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron tipos de eventos")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        return sendResponse(res, 200, "tipos de eventos obtenidos correctamente", { eventos: result.eventos });
    },
    getLocationType: async (req: Request, res: Response) => {
        const result = await ticketService.getAllUbicacion();

        if (result.status === 'empty') {
            return sendResponse(res, 404, "no se encontraron las ubicaciones")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        return sendResponse(res, 200, 'ubicaciones obtenidas correctamente', { ubicaciones: result.ubicaciones });
    },

    const getUnityType = async (req: Request, res: Response) => {
        const result = await ticketService.getAllUnidad();

        if (result.status === 'empty') {

            return sendResponse(res, 404, "no se encontraron tipos de unidad")
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }


        return sendResponse(res, 200, 'Tipos de unidad obtenidos correctamente', { unidades: result.unidades });
    },
    getTicketsType: async (req: AuthRequest, res: Response) => {

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

        const result = await ticketService.getAllTicket(userId, { page, limit, offset, filters });

        if (result.status === 'empty') {

            return sendResponse(res, 404, 'No se encontraron tickets para el usuario')
        }

        if (result.status === 'error') {
            return sendResponse(res, 500, result.message)
        }

        return sendResponse(res, 200, 'Tickets obtenidos correctamente', { tickets: result.tickets });
    },
*/