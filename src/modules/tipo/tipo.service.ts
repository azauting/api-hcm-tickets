import { logger } from '../../utils/logger';
import pool from '../../config/db.config';
import type { RowDataPacket } from 'mysql2';

const log = logger.child({ ubicacion: 'tipoService' });

export const tipoService = {
    createTipoEvento: async (evento: string): Promise<{ status: 'ok'; newTipoEventoId: number } | { status: 'conflict' }> => {
        log.info({ action: 'createTipoEvento', evento }, 'Creando nuevo tipo de evento');
        try {
            // Verificar si el tipo de evento ya existe
            const [existingTipos] = await pool.query<RowDataPacket[]>(
                'SELECT evento_id FROM tipo_evento WHERE evento = ?',
                [evento]
            );
            if (existingTipos.length > 0) {
                log.warn({ evento }, 'El tipo de evento ya existe');
                return { status: 'conflict' };
            }
            
            const [result] = await pool.query<RowDataPacket[]>(
                `
                INSERT INTO tipo_evento (evento)
                VALUES (?)
                `,
                [evento]
            );
            
            const newTipoEventoId = (result as any).insertId;
            log.info({ newTipoEventoId, evento }, 'Tipo de evento creado correctamente');
            return { status: 'ok', newTipoEventoId };
        } catch (error) {
            log.error({ error, evento }, 'Error al crear nuevo tipo de evento');
            throw error;
        }
    },
    createArea: async (nombre_area: string): Promise<{ status: 'ok'; newAreaId: number } | { status: 'conflict' }> => {
        log.info({ action: 'createArea', nombre_area }, 'Creando nuevo tipo de area');
        try {
            // Verificar si el tipo de área ya existe
            const [existingAreas] = await pool.query<RowDataPacket[]>(
                'SELECT area_id FROM area WHERE nombre_area = ?',
                [nombre_area]
            );
            if (existingAreas.length > 0) {
                log.warn({ nombre_area }, 'El tipo de área ya existe');
                return { status: 'conflict' };
            }
            const [result] = await pool.query<RowDataPacket[]>(
                `
                INSERT INTO area (nombre_area)
                VALUES (?)
                `,
                [nombre_area]
            );
            
            const newAreaId = (result as any).insertId;
            log.info({ newAreaId, nombre_area }, 'area creado correctamente');
            return { status: 'ok', newAreaId };
        } catch (error) {
            log.error({ error, nombre_area }, 'Error al crear nuevo tipo de área');
            throw error;
        }
    },
    createUbicacion: async (ubicacion: string, area_id: number): Promise<{ status: 'ok'; newUbicacionId: number } | { status: 'conflict' }> => {
        log.info({ action: 'createUbicacion', ubicacion, area_id }, 'Creando nueva ubicacion');
        try {
            // Verificar si la ubicacion ya existe
            const [existingUbicaciones] = await pool.query<RowDataPacket[]>(
                'SELECT ubicacion_id FROM ubicacion WHERE ubicacion = ?',
                [ubicacion]
            );
            if (existingUbicaciones.length > 0) {
                log.warn({ ubicacion }, 'La ubicacion ya existe');
                return { status: 'conflict' };
            }
            const [result] = await pool.query<RowDataPacket[]>(
                `
                INSERT INTO ubicacion (ubicacion, area_id)
                VALUES (?, ?)
                `,
                [ubicacion, area_id]
            );
            
            const newUbicacionId = (result as any).insertId;
            log.info({ newUbicacionId, ubicacion }, 'Ubicacion creada correctamente');
            return { status: 'ok', newUbicacionId };
        } catch (error) {
            log.error({ error, ubicacion }, 'Error al crear nueva ubicacion');
            throw error;
        }
    },
    updateTipoEvento: async (eventoId: number, newEvento: string): Promise<{ status: 'ok' | 'not_found' | 'conflict' }> => {
        log.info({ action: 'updateTipoEvento', eventoId, newEvento }, 'Actualizando tipo de evento');
        try {
            // Verificar si el tipo de evento existe
            const [existingTipos] = await pool.query<RowDataPacket[]>(
                'SELECT evento_id FROM tipo_evento WHERE evento_id = ?',
                [eventoId]
            );
            if (existingTipos.length === 0) {
                log.warn({ eventoId }, 'Tipo de evento no encontrado');
                return { status: 'not_found' };
            }
            // Verificar si el nuevo nombre ya está en uso por otro tipo de evento
            const [conflictTipos] = await pool.query<RowDataPacket[]>(
                'SELECT evento_id FROM tipo_evento WHERE evento = ? AND evento_id != ?',
                [newEvento, eventoId]
            );
            if (conflictTipos.length > 0) {
                log.warn({ newEvento }, 'El tipo de evento ya existe');
                return { status: 'conflict' };
            }
            await pool.query<RowDataPacket[]>(
                `
                UPDATE tipo_evento
                SET evento = ?
                WHERE evento_id = ?
                `,
                [newEvento, eventoId]
            );
            log.info({ eventoId, newEvento }, 'Tipo de evento actualizado correctamente');
            return { status: 'ok' };
        } catch (error) {
            log.error({ error, eventoId }, 'Error al actualizar tipo de evento');
            throw error;
        }
    },
    updateArea: async (areaId: number, newNombreArea: string): Promise<{ status: 'ok' | 'not_found' | 'conflict' }> => {
        log.info({ action: 'updateArea', areaId, newNombreArea }, 'Actualizando area');
        try {
            // Verificar si el area existe
            const [existingAreas] = await pool.query<RowDataPacket[]>(
                'SELECT area_id FROM area WHERE area_id = ?',
                [areaId]
            );
            if (existingAreas.length === 0) {
                log.warn({ areaId }, 'Area no encontrada');
                return { status: 'not_found' };
            }
            // Verificar si el nuevo nombre ya está en uso por otra area
            const [conflictAreas] = await pool.query<RowDataPacket[]>(
                'SELECT area_id FROM area WHERE nombre_area = ? AND area_id != ?',
                [newNombreArea, areaId]
            );
            if (conflictAreas.length > 0) {
                log.warn({ newNombreArea }, 'El nombre del área ya existe');
                return { status: 'conflict' };
            }
            await pool.query<RowDataPacket[]>(
                `
                UPDATE area
                SET nombre_area = ?
                WHERE area_id = ?
                `,
                [newNombreArea, areaId]
            );
            log.info({ areaId, newNombreArea }, 'Area actualizada correctamente');
            return { status: 'ok' };
        } catch (error) {
            log.error({ error, areaId }, 'Error al actualizar area');
            throw error;
        }
    },
    updateUbicacion: async (ubicacionId: number, ubicacion: string, area_id: number): Promise<{ status: 'ok' | 'not_found' | 'conflict' }> => {
        log.info({ action: 'updateUbicacion', ubicacionId, ubicacion, area_id }, 'Actualizando ubicacion');
        try {
            // Verificar si la ubicacion existe
            const [existingUbicaciones] = await pool.query<RowDataPacket[]>(
                'SELECT ubicacion_id FROM ubicacion WHERE ubicacion_id = ?',
                [ubicacionId]
            );
            // si la ubicacion no existe error
            if (existingUbicaciones.length === 0) {
                log.warn({ ubicacionId }, 'Ubicacion no encontrada');
                return { status: 'not_found' };
            }
            // Verificar si el nuevo nombre ya está en uso por otra ubicacion
            const [conflictUbicaciones] = await pool.query<RowDataPacket[]>(
                'SELECT ubicacion_id FROM ubicacion WHERE ubicacion = ? AND ubicacion_id != ?',
                [ubicacion, ubicacionId]
            );
            if (conflictUbicaciones.length > 0) {
                log.warn({ ubicacion }, 'La ubicacion ya existe');
                return { status: 'conflict' };
            }
            await pool.query<RowDataPacket[]>(
                `
                UPDATE ubicacion
                SET ubicacion = ?, area_id = ?
                WHERE ubicacion_id = ?
                `,
                [ubicacion, area_id, ubicacionId]
            );
            log.info({ ubicacionId, ubicacion, area_id }, 'Ubicacion actualizada correctamente');
            return { status: 'ok' };
        } catch (error) {
            log.error({ error, ubicacionId }, 'Error al actualizar ubicacion');
            throw error;
        }
    },
    getTipoEventos: async (): Promise<{ status: 'ok'; tipos: Array<{ evento_id: number; evento: string }> } | { status: 'empty' }> => {
        log.info({ action: 'getTipoEventos' }, 'Obteniendo todos los tipos de evento');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
                SELECT evento_id, evento
                FROM tipo_evento
                `
            );
            if (rows.length === 0) {
                log.info('No se encontraron tipos de evento');
                return { status: 'empty' };
            }
            const tipos = rows.map(row => ({
                evento_id: row.evento_id,
                evento: row.evento
            }));
            log.info({ count: tipos.length }, 'Tipos de evento obtenidos correctamente');
            return { status: 'ok', tipos };
        } catch (error) {
            log.error({ error }, 'Error al obtener tipos de evento');
            throw error;
        }
    },
    getAreas: async (): Promise<{ status: 'ok'; areas: Array<{ area_id: number; nombre_area: string }> } | { status: 'empty' }> => {
        log.info({ action: 'getAreas' }, 'Obteniendo todas las areas');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
                SELECT area_id, nombre_area
                FROM area
                `
            );
            if (rows.length === 0) {
                log.info('No se encontraron areas');
                return { status: 'empty' };
            }
            const areas = rows.map(row => ({
                area_id: row.area_id,
                nombre_area: row.nombre_area
            }));
            log.info({ count: areas.length }, 'Areas obtenidas correctamente');
            return { status: 'ok', areas };
        } catch (error) {
            log.error({ error }, 'Error al obtener areas');
            throw error;
        }
    },
    getUbicaciones: async (): Promise<{ status: 'ok'; ubicaciones: Array<{ ubicacion_id: number; ubicacion: string; area_id: number }> } | { status: 'empty' }> => {
        log.info({ action: 'getUbicaciones' }, 'Obteniendo todas las ubicaciones');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
                SELECT ubicacion_id, ubicacion, area_id
                FROM ubicacion
                `
            );
            if (rows.length === 0) {
                log.info('No se encontraron ubicaciones');
                return { status: 'empty' };
            }
            const ubicaciones = rows.map(row => ({
                ubicacion_id: row.ubicacion_id,
                ubicacion: row.ubicacion,
                area_id: row.area_id
            }));
            log.info({ count: ubicaciones.length }, 'Ubicaciones obtenidas correctamente');
            return { status: 'ok', ubicaciones };
        } catch (error) {
            log.error({ error }, 'Error al obtener ubicaciones');
            throw error;
        }
    },
    getTipoEventoById: async (eventoId: number): Promise<{ status: 'ok'; tipo: { evento_id: number; evento: string } } | { status: 'not_found' }> => {
        log.info({ action: 'getTipoEventoById', eventoId }, 'Obteniendo tipo de evento por ID');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
                SELECT evento_id, evento
                FROM tipo_evento
                WHERE evento_id = ?
                `,
                [eventoId]
            );
            if (rows.length === 0) {
                log.warn({ eventoId }, 'Tipo de evento no encontrado');
                return { status: 'not_found' };
            }
            const tipo = {
                evento_id: rows[0]!.evento_id,
                evento: rows[0]!.evento
            };
            log.info({ eventoId }, 'Tipo de evento obtenido correctamente');
            return { status: 'ok', tipo };
        } catch (error) {
            log.error({ error, eventoId }, 'Error al obtener tipo de evento por ID');
            throw error;
        }
    },
    getAreaById: async (areaId: number): Promise<{ status: 'ok'; area: { area_id: number; nombre_area: string } } | { status: 'not_found' }> => {
        log.info({ action: 'getAreaById', areaId }, 'Obteniendo area por ID');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
                SELECT area_id, nombre_area
                FROM area
                WHERE area_id = ?
                `,
                [areaId]
            );
            if (rows.length === 0) {
                log.warn({ areaId }, 'Area no encontrada');
                return { status: 'not_found' };
            }
            const area = {
                area_id: rows[0]!.area_id,
                nombre_area: rows[0]!.nombre_area
            };
            log.info({ areaId }, 'Area obtenida correctamente');
            return { status: 'ok', area };
        } catch (error) {
            log.error({ error, areaId }, 'Error al obtener area por ID');
            throw error;
        }
    },
    getUbicacionById: async (ubicacionId: number): Promise<{ status: 'ok'; ubicacion: { ubicacion_id: number; ubicacion: string; area_id: number } } | { status: 'not_found' }> => {
        log.info({ action: 'getUbicacionById', ubicacionId }, 'Obteniendo ubicacion por ID');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
                SELECT ubicacion_id, ubicacion, area_id
                FROM ubicacion
                WHERE ubicacion_id = ?
                `,
                [ubicacionId]
            );
            if (rows.length === 0) {
                log.warn({ ubicacionId }, 'Ubicacion no encontrada');
                return { status: 'not_found' };
            }
            const ubicacion = {
                ubicacion_id: rows[0]!.ubicacion_id,
                ubicacion: rows[0]!.ubicacion,
                area_id: rows[0]!.area_id
            };
            log.info({ ubicacionId }, 'Ubicacion obtenida correctamente');
            return { status: 'ok', ubicacion };
        } catch (error) {
            log.error({ error, ubicacionId }, 'Error al obtener ubicacion por ID');
            throw error;
        }
    }
};
