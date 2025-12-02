import type { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { tipoService } from './tipo.service';
import { parseIdParam, sendResponse } from '../../utils/helper';
import type { AuthRequest } from '../../utils/interfaces';

const log = logger.child({ location: 'typeController' });

export const tipoController = {

    // CREATE EVENT TYPE
    createEventType: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Creating new event type');
            const { evento: event } = req.body;
            const result = await tipoService.createEventType(event);

            if (result.status === 'conflict') {
                log.info({ event }, 'Event type already exists');
                return sendResponse(res, 409, 'El tipo de evento ya existe');
            }

            const { newEventTypeId } = result;
            log.info({ newEventTypeId, event }, 'Event type created successfully');
            return sendResponse(res, 201, 'Tipo de evento creado correctamente', { tipo_evento_id: newEventTypeId });

        } catch (error) {
            log.error({ error }, 'Internal error while creating event type');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // CREATE AREA
    createArea: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Creating new area');
            const { nombre_area: area_name } = req.body;
            const result = await tipoService.createArea(area_name);

            if (result.status === 'conflict') {
                log.info({ area_name }, 'Area already exists');
                return sendResponse(res, 409, 'El tipo de área ya existe');
            }

            const { newAreaId } = result;
            log.info({ newAreaId, area_name }, 'Area created successfully');
            return sendResponse(res, 201, 'Área creada correctamente', { area_id: newAreaId });

        } catch (error) {
            log.error({ error }, 'Internal error while creating area');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // CREATE LOCATION
    createLocation: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Creating new location');
            const { ubicacion: location, area_id: areaId } = req.body;
            const result = await tipoService.createLocation(location, areaId);

            if (result.status === 'conflict') {
                log.info({ location }, 'Location already exists');
                return sendResponse(res, 409, 'La ubicación ya existe');
            }

            const { newLocationId } = result;
            log.info({ newLocationId, location }, 'Location created successfully');
            return sendResponse(res, 201, 'Ubicación creada correctamente', { ubicacion_id: newLocationId });

        } catch (error) {
            log.error({ error }, 'Internal error while creating location');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // UPDATE EVENT TYPE
    updateEventType: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Updating event type');
            const eventTypeId = parseIdParam(req.params.id);
            const { evento: event } = req.body;
            const result = await tipoService.updateEventType(eventTypeId, event);

            if (result.status === 'not_found') {
                log.info({ eventTypeId }, 'Event type not found');
                return sendResponse(res, 404, 'Tipo de evento no encontrado');
            }

            log.info({ eventTypeId }, 'Event type updated successfully');
            return sendResponse(res, 200, 'Tipo de evento actualizado correctamente');

        } catch (error) {
            log.error({ error }, 'Internal error while updating event type');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // UPDATE AREA
    updateArea: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Updating area');
            const areaId = parseIdParam(req.params.id);
            const { nombre_area: area_name } = req.body;
            const result = await tipoService.updateArea(areaId, area_name);

            if (result.status === 'not_found') {
                log.info({ areaId }, 'Area not found');
                return sendResponse(res, 404, 'Área no encontrada');
            }

            log.info({ areaId }, 'Area updated successfully');
            return sendResponse(res, 200, 'Área actualizada correctamente');

        } catch (error) {
            log.error({ error }, 'Internal error while updating area');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // UPDATE LOCATION
    updateLocation: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Updating location');
            const locationId = parseIdParam(req.params.id);
            const { ubicacion: location, area_id: areaId } = req.body;
            const result = await tipoService.updateLocation(locationId, location, areaId);

            if (result.status === 'not_found') {
                log.info({ locationId }, 'Location not found');
                return sendResponse(res, 404, 'Ubicación no encontrada');
            }

            log.info({ locationId }, 'Location updated successfully');
            return sendResponse(res, 200, 'Ubicación actualizada correctamente');

        } catch (error) {
            log.error({ error }, 'Internal error while updating location');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET EVENT TYPES
    getEventTypes: async (req: Request, res: Response) => {
        try {
            log.info('Fetching event types');
            const eventTypes = await tipoService.getEventTypes();
            return sendResponse(res, 200, 'Tipos de evento obtenidos correctamente', { tipos_evento: eventTypes });
        } catch (error) {
            log.error({ error }, 'Internal error while fetching event types');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET AREAS
    getAreas: async (req: Request, res: Response) => {
        try {
            log.info('Fetching areas');
            const areas = await tipoService.getAreas();
            return sendResponse(res, 200, 'Áreas obtenidas correctamente', { tipos_area: areas });
        } catch (error) {
            log.error({ error }, 'Internal error while fetching areas');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET LOCATIONS
    getLocations: async (req: Request, res: Response) => {
        try {
            log.info('Fetching locations');
            const locations = await tipoService.getLocations();
            return sendResponse(res, 200, 'Ubicaciones obtenidas correctamente', { tipos_ubicacion: locations });
        } catch (error) {
            log.error({ error }, 'Internal error while fetching locations');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET EVENT TYPE BY ID
    getEventTypeById: async (req: Request, res: Response) => {
        try {
            const eventTypeId = parseIdParam(req.params.id);
            log.info({ eventTypeId }, 'Fetching event type by ID');
            const eventType = await tipoService.getEventTypeById(eventTypeId);

            if (!eventType) {
                log.info({ eventTypeId }, 'Event type not found');
                return sendResponse(res, 404, 'Tipo de evento no encontrado');
            }

            return sendResponse(res, 200, 'Tipo de evento obtenido correctamente', { tipo_evento: eventType });

        } catch (error) {
            log.error({ error }, 'Internal error while fetching event type by ID');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET AREA BY ID
    getAreaById: async (req: Request, res: Response) => {
        try {
            const areaId = parseIdParam(req.params.id);
            log.info({ areaId }, 'Fetching area by ID');
            const area = await tipoService.getAreaById(areaId);

            if (!area) {
                log.info({ areaId }, 'Area not found');
                return sendResponse(res, 404, 'Área no encontrada');
            }

            return sendResponse(res, 200, 'Área obtenida correctamente', { area });

        } catch (error) {
            log.error({ error }, 'Internal error while fetching area by ID');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET LOCATION BY ID
    getLocationById: async (req: Request, res: Response) => {
        try {
            const locationId = parseIdParam(req.params.id);
            log.info({ locationId }, 'Fetching location by ID');
            const location = await tipoService.getLocationById(locationId);

            if (!location) {
                log.info({ locationId }, 'Location not found');
                return sendResponse(res, 404, 'Ubicación no encontrada');
            }

            return sendResponse(res, 200, 'Ubicación obtenida correctamente', { ubicacion: location });

        } catch (error) {
            log.error({ error }, 'Internal error while fetching location by ID');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET UNIT TYPES
    getUnitTypes: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Fetching unit types');
            const tiposUnidad = await tipoService.getUnitTypes();
            return sendResponse(res, 200, 'Tipos de unidad obtenidos correctamente', { tipos_unidad: tiposUnidad });

        } catch (error) {
            log.error({ error }, 'Internal error while fetching unit types');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET STATUS TYPES
    getStatusTypes: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Fetching status types');
            const tiposEstado = await tipoService.getStatusTypes();
            return sendResponse(res, 200, 'Tipos de estado obtenidos correctamente', { tipos_estado: tiposEstado });

        } catch (error) {
            log.error({ error }, 'Internal error while fetching status types');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET PRIORITY TYPES
    getPriorityTypes: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Fetching priority types');
            const tiposPrioridad = await tipoService.getPriorityTypes();
            return sendResponse(res, 200, 'Tipos de prioridad obtenidos correctamente', { tipos_prioridad: tiposPrioridad });

        } catch (error) {
            log.error({ error }, 'Internal error while fetching priority types');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

    // GET ORIGIN TYPES
    getOriginTypes: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Fetching origin types');
            const tiposOrigen = await tipoService.getOriginTypes();
            return sendResponse(res, 200, 'Tipos de origen obtenidos correctamente', { tipos_origen: tiposOrigen });

        } catch (error) {
            log.error({ error }, 'Internal error while fetching origin types');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },

};
