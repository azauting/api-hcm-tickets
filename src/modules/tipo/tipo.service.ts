import { logger } from '../../utils/logger';
import pool from '../../config/db.config';
import type { RowDataPacket } from 'mysql2';

const log = logger.child({ location: 'typeService' });

export const tipoService = {

    // CREATE EVENT TYPE
    createEventType: async (event: string): Promise<{ status: 'ok'; newEventTypeId: number } | { status: 'conflict' }> => {
        log.info({ action: 'createEventType', event }, 'Creating new event type');
        try {
            const [existing] = await pool.query<RowDataPacket[]>(
                'SELECT evento_id FROM tipo_evento WHERE evento = ?',
                [event]
            );

            if (existing.length > 0) {
                log.warn({ event }, 'Event type already exists');
                return { status: 'conflict' };
            }

            const [result] = await pool.query<RowDataPacket[]>(
                `INSERT INTO tipo_evento (evento) VALUES (?)`,
                [event]
            );

            const newEventTypeId = (result as any).insertId;
            log.info({ newEventTypeId, event }, 'Event type created successfully');
            return { status: 'ok', newEventTypeId };

        } catch (error) {
            log.error({ error, event }, 'Error creating event type');
            throw error;
        }
    },

    // CREATE AREA
    createArea: async (areaName: string): Promise<{ status: 'ok'; newAreaId: number } | { status: 'conflict' }> => {
        log.info({ action: 'createArea', areaName }, 'Creating new area');
        try {
            const [existing] = await pool.query<RowDataPacket[]>(
                'SELECT area_id FROM area WHERE nombre_area = ?',
                [areaName]
            );

            if (existing.length > 0) {
                log.warn({ areaName }, 'Area already exists');
                return { status: 'conflict' };
            }

            const [result] = await pool.query<RowDataPacket[]>(
                `INSERT INTO area (nombre_area) VALUES (?)`,
                [areaName]
            );

            const newAreaId = (result as any).insertId;
            log.info({ newAreaId, areaName }, 'Area created successfully');

            return { status: 'ok', newAreaId };

        } catch (error) {
            log.error({ error, areaName }, 'Error creating area');
            throw error;
        }
    },

    // CREATE LOCATION
    createLocation: async (location: string, areaId: number): Promise<{ status: 'ok'; newLocationId: number } | { status: 'conflict' }> => {
        log.info({ action: 'createLocation', location, areaId }, 'Creating new location');
        try {
            const [existing] = await pool.query<RowDataPacket[]>(
                'SELECT ubicacion_id FROM ubicacion WHERE ubicacion = ?',
                [location]
            );

            if (existing.length > 0) {
                log.warn({ location }, 'Location already exists');
                return { status: 'conflict' };
            }

            const [result] = await pool.query<RowDataPacket[]>(
                `INSERT INTO ubicacion (ubicacion, area_id) VALUES (?, ?)`,
                [location, areaId]
            );

            const newLocationId = (result as any).insertId;
            log.info({ newLocationId, location }, 'Location created successfully');

            return { status: 'ok', newLocationId };

        } catch (error) {
            log.error({ error, location }, 'Error creating location');
            throw error;
        }
    },

    // UPDATE EVENT TYPE
    updateEventType: async (eventTypeId: number, newEvent: string): Promise<{ status: 'ok' | 'not_found' | 'conflict' }> => {
        log.info({ action: 'updateEventType', eventTypeId, newEvent }, 'Updating event type');
        try {
            const [existing] = await pool.query<RowDataPacket[]>(
                'SELECT evento_id FROM tipo_evento WHERE evento_id = ?',
                [eventTypeId]
            );

            if (existing.length === 0) {
                log.warn({ eventTypeId }, 'Event type not found');
                return { status: 'not_found' };
            }

            const [conflict] = await pool.query<RowDataPacket[]>(
                'SELECT evento_id FROM tipo_evento WHERE evento = ? AND evento_id != ?',
                [newEvent, eventTypeId]
            );

            if (conflict.length > 0) {
                log.warn({ newEvent }, 'Event type name already exists');
                return { status: 'conflict' };
            }

            await pool.query<RowDataPacket[]>(
                `UPDATE tipo_evento SET evento = ? WHERE evento_id = ?`,
                [newEvent, eventTypeId]
            );

            log.info({ eventTypeId, newEvent }, 'Event type updated successfully');
            return { status: 'ok' };

        } catch (error) {
            log.error({ error, eventTypeId }, 'Error updating event type');
            throw error;
        }
    },

    // UPDATE AREA
    updateArea: async (areaId: number, newAreaName: string): Promise<{ status: 'ok' | 'not_found' | 'conflict' }> => {
        log.info({ action: 'updateArea', areaId, newAreaName }, 'Updating area');
        try {
            const [existing] = await pool.query<RowDataPacket[]>(
                'SELECT area_id FROM area WHERE area_id = ?',
                [areaId]
            );

            if (existing.length === 0) {
                log.warn({ areaId }, 'Area not found');
                return { status: 'not_found' };
            }

            const [conflict] = await pool.query<RowDataPacket[]>(
                'SELECT area_id FROM area WHERE nombre_area = ? AND area_id != ?',
                [newAreaName, areaId]
            );

            if (conflict.length > 0) {
                log.warn({ newAreaName }, 'Area name already exists');
                return { status: 'conflict' };
            }

            await pool.query<RowDataPacket[]>(
                `UPDATE area SET nombre_area = ? WHERE area_id = ?`,
                [newAreaName, areaId]
            );

            log.info({ areaId, newAreaName }, 'Area updated successfully');
            return { status: 'ok' };

        } catch (error) {
            log.error({ error, areaId }, 'Error updating area');
            throw error;
        }
    },

    // UPDATE LOCATION
    updateLocation: async (locationId: number, location: string, areaId: number): Promise<{ status: 'ok' | 'not_found' | 'conflict' }> => {
        log.info({ action: 'updateLocation', locationId, location, areaId }, 'Updating location');
        try {
            const [existing] = await pool.query<RowDataPacket[]>(
                'SELECT ubicacion_id FROM ubicacion WHERE ubicacion_id = ?',
                [locationId]
            );

            if (existing.length === 0) {
                log.warn({ locationId }, 'Location not found');
                return { status: 'not_found' };
            }

            const [conflict] = await pool.query<RowDataPacket[]>(
                'SELECT ubicacion_id FROM ubicacion WHERE ubicacion = ? AND ubicacion_id != ?',
                [location, locationId]
            );

            if (conflict.length > 0) {
                log.warn({ location }, 'Location name already exists');
                return { status: 'conflict' };
            }

            await pool.query<RowDataPacket[]>(
                `UPDATE ubicacion SET ubicacion = ?, area_id = ? WHERE ubicacion_id = ?`,
                [location, areaId, locationId]
            );

            log.info({ locationId, location, areaId }, 'Location updated successfully');
            return { status: 'ok' };

        } catch (error) {
            log.error({ error, locationId }, 'Error updating location');
            throw error;
        }
    },

    // GET ALL EVENT TYPES
    getEventTypes: async () => {
        log.info({ action: 'getEventTypes' }, 'Fetching event types');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT evento_id, evento FROM tipo_evento`
            );

            if (rows.length === 0) {
                log.info('No event types found');
                return { status: 'empty' };
            }

            const tipos = rows.map(r => ({
                evento_id: r.evento_id,
                evento: r.evento
            }));

            return { status: 'ok', tipos };

        } catch (error) {
            log.error({ error }, 'Error fetching event types');
            throw error;
        }
    },

    // GET ALL AREAS
    getAreas: async () => {
        log.info({ action: 'getAreas' }, 'Fetching areas');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT area_id, nombre_area FROM area`
            );

            if (rows.length === 0) {
                return { status: 'empty' };
            }

            const areas = rows.map(r => ({
                area_id: r.area_id,
                nombre_area: r.nombre_area
            }));

            return { status: 'ok', areas };

        } catch (error) {
            log.error({ error }, 'Error fetching areas');
            throw error;
        }
    },

    // GET ALL LOCATIONS
    getLocations: async () => {
        log.info({ action: 'getLocations' }, 'Fetching locations');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
                SELECT 
                    u.ubicacion_id,
                    u.ubicacion,
                    u.area_id,
                    a.nombre_area
                FROM ubicacion u
                LEFT JOIN area a ON a.area_id = u.area_id
                `
            );

            if (rows.length === 0) {
                return { status: 'empty' };
            }

            const ubicaciones = rows.map(row => ({
                ubicacion_id: row.ubicacion_id,
                ubicacion: row.ubicacion,
                area_id: row.area_id,
                nombre_area: row.nombre_area
            }));

            return { status: 'ok', ubicaciones };

        } catch (error) {
            log.error({ error }, 'Error fetching locations');
            throw error;
        }
    },

    // GET EVENT TYPE BY ID
    getEventTypeById: async (eventTypeId: number) => {
        log.info({ action: 'getEventTypeById', eventTypeId }, 'Fetching event type by ID');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT evento_id, evento FROM tipo_evento WHERE evento_id = ?`,
                [eventTypeId]
            );

            if (rows.length === 0) {
                return { status: 'not_found' };
            }

            return {
                status: 'ok',
                tipo: {
                    evento_id: rows[0]!.evento_id,
                    evento: rows[0]!.evento
                }
            };

        } catch (error) {
            log.error({ error, eventTypeId }, 'Error fetching event type by ID');
            throw error;
        }
    },

    // GET AREA BY ID
    getAreaById: async (areaId: number) => {
        log.info({ action: 'getAreaById', areaId }, 'Fetching area by ID');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT area_id, nombre_area FROM area WHERE area_id = ?`,
                [areaId]
            );

            if (rows.length === 0) {
                return { status: 'not_found' };
            }

            return {
                status: 'ok',
                area: {
                    area_id: rows[0]!.area_id,
                    nombre_area: rows[0]!.nombre_area
                }
            };

        } catch (error) {
            log.error({ error, areaId }, 'Error fetching area by ID');
            throw error;
        }
    },

    // GET LOCATION BY ID
    getLocationById: async (locationId: number) => {
        log.info({ action: 'getLocationById', locationId }, 'Fetching location by ID');

        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT ubicacion_id, ubicacion, area_id FROM ubicacion WHERE ubicacion_id = ?`,
                [locationId]
            );

            if (rows.length === 0) {
                return { status: 'not_found' };
            }

            return {
                status: 'ok',
                ubicacion: {
                    ubicacion_id: rows[0]!.ubicacion_id,
                    ubicacion: rows[0]!.ubicacion,
                    area_id: rows[0]!.area_id
                }
            };

        } catch (error) {
            log.error({ error, locationId }, 'Error fetching location by ID');
            throw error;
        }
    },

    // GET UNIT TYPES
    getUnitTypes: async () => {
        log.info({ action: 'getUnitTypes' }, 'Fetching unit types');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT unidad_id, unidad FROM tipo_unidad`
            );

            if (rows.length === 0) {
                return { status: 'empty' };
            }

            return {
                status: 'ok',
                unidades: rows.map(r => ({
                    unidad_id: r.unidad_id,
                    unidad: r.unidad
                }))
            };

        } catch (error) {
            log.error({ error }, 'Error fetching unit types');
            throw error;
        }
    },

    // GET STATUS TYPES
    getStatusTypes: async () => {
        log.info({ action: 'getStatusTypes' }, 'Fetching status types');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT estado_id, estado FROM tipo_estado`
            );

            if (rows.length === 0) {
                return { status: 'empty' };
            }

            return {
                status: 'ok',
                estados: rows.map(r => ({
                    estado_id: r.estado_id,
                    estado: r.estado
                }))
            };

        } catch (error) {
            log.error({ error }, 'Error fetching status types');
            throw error;
        }
    },

    // GET PRIORITY TYPES
    getPriorityTypes: async () => {
        log.info({ action: 'getPriorityTypes' }, 'Fetching priority types');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT prioridad_id, prioridad FROM tipo_prioridad`
            );

            if (rows.length === 0) {
                return { status: 'empty' };
            }

            return {
                status: 'ok',
                prioridades: rows.map(r => ({
                    prioridad_id: r.prioridad_id,
                    prioridad: r.prioridad
                }))
            };

        } catch (error) {
            log.error({ error }, 'Error fetching priority types');
            throw error;
        }
    },

    // GET ORIGIN TYPES
    getOriginTypes: async () => {
        log.info({ action: 'getOriginTypes' }, 'Fetching origin types');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT origen_id, origen FROM tipo_origen`
            );

            if (rows.length === 0) {
                return { status: 'empty' };
            }

            return {
                status: 'ok',
                origenes: rows.map(r => ({
                    origen_id: r.origen_id,
                    origen: r.origen
                }))
            };

        } catch (error) {
            log.error({ error }, 'Error fetching origin types');
            throw error;
        }
    },

};
