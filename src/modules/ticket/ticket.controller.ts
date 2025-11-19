import type { Request, Response } from 'express';
import type { AuthRequest } from '../../utils/interfaces';
import { validadorTicketForm } from '../../utils/validatorTicketForm';
import { ticketService } from './ticket.service';
import { logger } from '../../utils/logger';
import type { TicketCreateDTO } from '../../utils/interfaces';
import { ticketLogController } from '../ticketLog/ticketLog.controller';
import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { sendResponse } from '../../utils/helper';

const log = logger.child({ ubicacion: 'ticketController' });


const createTicket = async (req: AuthRequest, res: Response) => {
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

    if (logResult.status === 'error') {
        log.error({ ticket_id }, 'Error al crear el log del ticket')
        // llamamos al servicio para eliminar el ticket
        await ticketService.deleteTicketId(ticket_id);
        return sendResponse(res, 500, 'Error al crear el log del ticket, se ha eliminado el ticket creado');
    }
    // si todo sale bien
    log.info({ ticket_id }, 'Log del ticket creado correctamente');
    // décimo paso, retornar respuesta exitosa
    return sendResponse(res, 201, 'Ticket creado correctamente', { ticket_id });
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
// metodo para obtener todos los tipos de estado
const getStatusType = async (req: Request, res: Response) => {

    const result = await ticketService.getAllTipoEstado();

    if (result.status === 'error') {
        return res.status(500).json({ message: result });
        return sendResponse(res, 500, "error al obtener los tipos de estado")
    }

    if (result.status === 'empty') {
        return sendResponse(res, 404, "no se encontraron tipos de estado registrados")
    }

    // status === 'ok'
    return sendResponse(res, 200, "tipos de estado obtenidos correctamente", { estados: result.estados })
};
//metodos para obtener todos los tipos de prioridad

const getPriorityType = async (req: Request, res: Response) => {

    const result = await ticketService.getAllTipoPrioridad();

    if (result.status === 'empty') {
        return sendResponse(res, 404, "no se encontraron tipos de prioridad")
    }

    if (result.status === 'error') {
        return sendResponse(res, 500, "error al obtener los tipos de prioridad")
    }

    return sendResponse(res, 200, "tipos de prioridad obtenidos correctamente", { prioiridades: result.prioridades })

}

// metodo para obtener todos los tipos de origen
const getOriginType = async (req: Request, res: Response) => {
    const result = await ticketService.getAllTipoOrigen();

    if (result.status === 'empty') {
        return sendResponse(res, 404, "no se encontraron tipos de origen")
    }

    if (result.status === 'error') {

        return sendResponse(res, 500, "error al obtener los tipos de origen")

    }


    return sendResponse(res, 200, "tipos de origen obtenidos correctamente", { origen: result.origen })
};

const getEventType = async (req: Request, res: Response) => {
    const result = await ticketService.getAllTipoEvento();

    if (result.status === 'empty') {
        return sendResponse(res, 404, "no se encontraron tipos de eventos")
    }

    if (result.status === 'error') {
        return sendResponse(res, 500, result.message)
    }

    return sendResponse(res, 200, "tipos de eventos obtenidos correctamente", { eventos: result.eventos });
}

const getLocationType = async (req: Request, res: Response) => {
    const result = await ticketService.getAllUbicacion();

    if (result.status === 'empty') {
        return sendResponse(res, 404, "no se encontraron las ubicaciones")
    }

    if (result.status === 'error') {
        return sendResponse(res, 500, result.message)
    }

    return sendResponse(res, 200, 'ubicaciones obtenidas correctamente', { ubicaciones: result.ubicaciones });


}

const getUnityType = async (req: Request, res: Response) => {
    const result = await ticketService.getAllUnidad();

    if (result.status === 'empty') {

        return sendResponse(res, 404, "no se encontraron tipos de unidad")
    }

    if (result.status === 'error') {
        return sendResponse(res, 500, result.message)
    }


    return sendResponse(res, 200, 'Tipos de unidad obtenidos correctamente', { unidades: result.unidades });
};


const getTicketsType = async (req: AuthRequest, res: Response) => {

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
}

const getTicketById = async (req: AuthRequest, res: Response) => {
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
        return sendResponse(res, 404, 'Ticket no encontrado');
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
};
export { createTicket, getStatusType, getPriorityType, getOriginType, getEventType, getLocationType, getUnityType, getTicketsType, getTicketById };