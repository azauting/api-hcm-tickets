import type { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { tipoService } from './tipo.service';
import { parseIdParam, sendResponse } from '../../utils/helper';
import type { AuthRequest } from '../../utils/interfaces';

const log = logger.child({ ubicacion: 'tipoController' });

export const tipoController = {
    createTipoEvento: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Creando nuevo tipo de evento');
            const { evento } = req.body;
            const result = await tipoService.createTipoEvento(evento);

            if (result.status === 'conflict') {
                log.info({ evento }, 'El tipo de evento ya existe');
                return sendResponse(res, 409, 'El tipo de evento ya existe');
            }

            // result.status === 'ok'
            const { newTipoEventoId } = result;
            log.info({ newTipoEventoId, evento }, 'Tipo de evento creado correctamente');
            return sendResponse(res, 201, 'Tipo de evento creado correctamente', { tipo_evento_id: newTipoEventoId });

        } catch (error) {
            log.error({ error }, 'Error interno al crear nuevo tipo de evento');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    createTipoArea: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Creando nuevo tipo de area');
            const { nombre_area } = req.body;
            const result = await tipoService.createArea(nombre_area);

            if (result.status === 'conflict') {
                log.info({ nombre_area }, 'El tipo de área ya existe');
                return sendResponse(res, 409, 'El tipo de área ya existe');
            }

            // result.status === 'ok'
            const { newAreaId } = result;
            log.info({ newAreaId, nombre_area }, 'area creado correctamente');
            return sendResponse(res, 201, 'area creado correctamente', { area_id: newAreaId });

        } catch (error) {
            log.error({ error }, 'Error interno al crear nuevo tipo de área');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    createUbicacion: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Creando nueva ubicacion');
            const { ubicacion, area_id } = req.body;
            const result = await tipoService.createUbicacion(ubicacion, area_id);

            if (result.status === 'conflict') {
                log.info({ ubicacion }, 'La ubicacion ya existe');
                return sendResponse(res, 409, 'La ubicacion ya existe');
            }

            // result.status === 'ok'
            const { newUbicacionId } = result;
            log.info({ newUbicacionId, ubicacion }, 'Ubicacion creada correctamente');
            return sendResponse(res, 201, 'Ubicacion creada correctamente', { ubicacion_id: newUbicacionId });

        } catch (error) {
            log.error({ error }, 'Error interno al crear nueva ubicacion');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    updateTipoEvento: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Actualizando tipo de evento');
            const tipoEventoId = parseIdParam(req.params.id);
            const { evento } = req.body;
            const result = await tipoService.updateTipoEvento(tipoEventoId, evento);

            if (result.status === 'not_found') {
                log.info({ tipoEventoId }, 'Tipo de evento no encontrado');
                return sendResponse(res, 404, 'Tipo de evento no encontrado');
            }

            // result.status === 'ok'
            log.info({ tipoEventoId }, 'Tipo de evento actualizado correctamente');
            return sendResponse(res, 200, 'Tipo de evento actualizado correctamente');

        } catch (error) {
            log.error({ error }, 'Error interno al actualizar tipo de evento');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    updateArea: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Actualizando area');
            const areaId = parseIdParam(req.params.id);
            const { nombre_area } = req.body;
            const result = await tipoService.updateoArea(areaId, nombre_area);
            if (result.status === 'not_found') {
                log.info({ areaId }, 'Area no encontrada');
                return sendResponse(res, 404, 'Area no encontrada');
            }

            // result.status === 'ok'
            log.info({ areaId }, 'Area actualizada correctamente');
            return sendResponse(res, 200, 'Area actualizada correctamente');

        } catch (error) {
            log.error({ error }, 'Error interno al actualizar area');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    updateUbicacion: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Actualizando ubicacion');
            const ubicacionId = parseIdParam(req.params.id);
            const { ubicacion, area_id } = req.body;
            const result = await tipoService.updateUbicacion(ubicacionId, ubicacion, area_id);
            if (result.status === 'not_found') {
                log.info({ ubicacionId }, 'Ubicacion no encontrada');
                return sendResponse(res, 404, 'Ubicacion no encontrada');
            }

            // result.status === 'ok'
            log.info({ ubicacionId }, 'Ubicacion actualizada correctamente');
            return sendResponse(res, 200, 'Ubicacion actualizada correctamente');

        } catch (error) {
            log.error({ error }, 'Error interno al actualizar ubicacion');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getTipoEvento: async (req: Request, res: Response) => {
        try {
            log.info('Obteniendo tipos de evento');
            const tiposEvento = await tipoService.getTipoEventos();
            return sendResponse(res, 200, 'Tipos de evento obtenidos correctamente', { tipos_evento: tiposEvento });
        } catch (error) {
            log.error({ error }, 'Error interno al obtener tipos de evento');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getAreas: async (req: Request, res: Response) => {
        try {
            log.info('Obteniendo areas');
            const tiposArea = await tipoService.getAreas();
            return sendResponse(res, 200, 'Areas obtenidos correctamente', { tipos_area: tiposArea });
        } catch (error) {
            log.error({ error }, 'Error interno al obtener las areas');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getUbicaciones: async (req: Request, res: Response) => {
        try {
            log.info('Obteniendo tipos de ubicacion');
            const Ubicaciones = await tipoService.getUbicaciones();
            return sendResponse(res, 200, 'Ubicaciones obtenidos correctamente', { tipos_ubicacion: Ubicaciones });
        } catch (error) {
            log.error({ error }, 'Error interno al obtener las ubicaciones');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getTipoEventoById: async (req: Request, res: Response) => {
        try {
            const tipoEventoId = parseIdParam(req.params.id);
            log.info({ tipoEventoId }, 'Obteniendo tipo de evento por ID');
            const tipoEvento = await tipoService.getTipoEventoById(tipoEventoId);
            if (!tipoEvento) {
                log.info({ tipoEventoId }, 'Tipo de evento no encontrado');
                return sendResponse(res, 404, 'Tipo de evento no encontrado');
            }
            return sendResponse(res, 200, 'Tipo de evento obtenido correctamente', { tipo_evento: tipoEvento });
        } catch (error) {
            log.error({ error }, 'Error interno al obtener tipo de evento por ID');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getAreaById: async (req: Request, res: Response) => {
        try {
            const areaId = parseIdParam(req.params.id);
            log.info({ areaId }, 'Obteniendo area por ID');
            const area = await tipoService.getAreaById(areaId);
            if (!area) {
                log.info({ areaId }, 'Area no encontrada');
                return sendResponse(res, 404, 'Area no encontrada');
            }
            return sendResponse(res, 200, 'Area obtenida correctamente', { area });
        } catch (error) {
            log.error({ error }, 'Error interno al obtener area por ID');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getUbicacionById: async (req: Request, res: Response) => {
        try {
            const ubicacionId = parseIdParam(req.params.id);
            log.info({ ubicacionId }, 'Obteniendo ubicacion por ID');
            const ubicacion = await tipoService.getUbicacionById(ubicacionId);
            if (!ubicacion) {
                log.info({ ubicacionId }, 'Ubicacion no encontrada');
                return sendResponse(res, 404, 'Ubicacion no encontrada');
            }
            return sendResponse(res, 200, 'Ubicacion obtenida correctamente', { ubicacion });
        } catch (error) {
            log.error({ error }, 'Error interno al obtener ubicacion por ID');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
};