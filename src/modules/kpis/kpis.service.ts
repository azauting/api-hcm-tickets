
import pool from '../../config/db.config';
import type { RowDataPacket } from 'mysql2';
import { calculateJwkThumbprint } from 'jose';


export const kpiService = {
    // vista general
    getTicketCreatedToday: async (): Promise<number> => {
        const query = `
            SELECT COUNT(*) AS total
            FROM ticket_movimiento
            WHERE movimiento_id = 1
            AND DATE(fecha) = CURDATE();
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows[0]?.total || 0;
    },
    getTicketsClosedToday: async (): Promise<number> => {
        const query = `
            SELECT COUNT(*) AS total
            FROM ticket_movimiento
            WHERE movimiento_id = 5
            AND DATE(fecha) = CURDATE();
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows[0]?.total || 0;
    },
    getOpenTickets: async (): Promise<number> => {
        const query = `
            SELECT COUNT(*) AS total
            FROM ticket
            WHERE estado_id = 1;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows[0]?.total || 0;
    },
    getTicketsInProgress: async (): Promise<number> => {
        const query = `
            SELECT COUNT(*) AS total
            FROM ticket t
            WHERE t.ticket_id IN (
                SELECT ticket_id FROM ticket_movimiento WHERE movimiento_id = 3
            )
            AND t.ticket_id NOT IN (
                SELECT ticket_id FROM ticket_movimiento WHERE movimiento_id = 5
            );
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows[0]?.total || 0;
    },
    getLocationTreemap: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                a.nombre_area AS area,
                u.ubicacion AS ubicacion,
                COUNT(*) AS total
            FROM ticket t
            JOIN ubicacion u ON u.ubicacion_id = t.ubicacion_id
            JOIN area a ON a.area_id = u.area_id
            GROUP BY a.area_id, u.ubicacion_id
            ORDER BY a.nombre_area, u.ubicacion;`
        );

        // Agrupar por área
        const grouped: Record<string, any[]> = {};

        rows.forEach(row => {
            const area = row.area;

            if (!grouped[area]) grouped[area] = [];

            grouped[area].push({
                ubicacion: row.ubicacion,
                tickets: row.total
            });
        });

        return Object.entries(grouped).map(([area, data]) => ({
            name: area,
            data
        }));
    },
    getResolvedTicketsByMonth: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                MONTHNAME(m.fecha) AS mes,
                COUNT(*) AS resueltos
            FROM ticket_movimiento m
            WHERE m.movimiento_id = 5
            AND YEAR(m.fecha) = YEAR(CURDATE()) -- IMPORTANTE: Solo año actual
            GROUP BY MONTH(m.fecha), MONTHNAME(m.fecha) -- Agrupamos por ambos para evitar error estricto
            ORDER BY MONTH(m.fecha);`
        );
        return rows;
    },
    getMTTRByMonth: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT
                YEAR(tc.fecha_cierre)  AS year,
                MONTH(tc.fecha_cierre) AS month,
                DATE_FORMAT(tc.fecha_cierre, '%M') AS mes,
                ROUND(
                    AVG(TIMESTAMPDIFF(MINUTE, tcrea.fecha_creacion, tc.fecha_cierre)) / 60,
                    2
                ) AS mttr_horas
            FROM (
                SELECT ticket_id, MIN(fecha) AS fecha_creacion
                FROM ticket_movimiento
                WHERE movimiento_id = 1
                GROUP BY ticket_id
            ) AS tcrea
            JOIN (
                SELECT ticket_id, MAX(fecha) AS fecha_cierre
                FROM ticket_movimiento
                WHERE movimiento_id = 5
                GROUP BY ticket_id
            ) AS tc
            ON tcrea.ticket_id = tc.ticket_id
            GROUP BY year, month, mes
            ORDER BY year, month;
            `
        );
        return rows;
    },
    getSLAComplianceGlobal: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT
            ROUND(
                SUM(
                    CASE 
                        WHEN 
                            (TIMESTAMPDIFF(MINUTE, creado.fecha_creacion, cerrado.fecha_cierre) / 60)
                                <=
                                CASE t.prioridad_id
                                    WHEN 1 THEN 1   -- Alta
                                    WHEN 2 THEN 2   -- Media
                                    WHEN 3 THEN 3   -- Baja
                                END
                        THEN 1 ELSE 0
                    END
                ) * 100 / COUNT(*),
            2) AS cumplimiento_sla
        FROM (
            SELECT ticket_id, MIN(fecha) AS fecha_creacion
            FROM ticket_movimiento
            WHERE movimiento_id = 1
            GROUP BY ticket_id
        ) creado
        JOIN (
            SELECT ticket_id, MAX(fecha) AS fecha_cierre
            FROM ticket_movimiento
            WHERE movimiento_id = 5
            GROUP BY ticket_id
        ) cerrado ON creado.ticket_id = cerrado.ticket_id
        JOIN ticket t ON t.ticket_id = creado.ticket_id;
    `);
        return rows[0];
    },
    getSLAComplianceByPriority: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT
            tp.prioridad,
            ROUND(
                SUM(
                    CASE 
                        WHEN 
                            (TIMESTAMPDIFF(MINUTE, creado.fecha_creacion, cerrado.fecha_cierre) / 60)
                                <=
                                CASE t.prioridad_id
                                    WHEN 1 THEN 1
                                    WHEN 2 THEN 2
                                    WHEN 3 THEN 3
                                END
                        THEN 1 ELSE 0
                    END
                ) * 100 / COUNT(*),
            2) AS cumplimiento_sla
        FROM (
            SELECT ticket_id, MIN(fecha) AS fecha_creacion
            FROM ticket_movimiento
            WHERE movimiento_id = 1
            GROUP BY ticket_id
        ) creado
        JOIN (
            SELECT ticket_id, MAX(fecha) AS fecha_cierre
            FROM ticket_movimiento
            WHERE movimiento_id = 5
            GROUP BY ticket_id
        ) cerrado ON creado.ticket_id = cerrado.ticket_id
        JOIN ticket t ON t.ticket_id = creado.ticket_id
        JOIN tipo_prioridad tp ON tp.prioridad_id = t.prioridad_id
        GROUP BY tp.prioridad_id
        ORDER BY tp.prioridad_id;
    `);

        return rows;
    },
    getMTTRByPriority: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT
            tp.prioridad,
            ROUND(AVG(TIMESTAMPDIFF(MINUTE, creado.fecha_creacion, cerrado.fecha_cierre)) / 60, 2) AS mttr_horas
        FROM (
            SELECT ticket_id, MIN(fecha) AS fecha_creacion
            FROM ticket_movimiento
            WHERE movimiento_id = 1
            GROUP BY ticket_id
        ) creado
        JOIN (
            SELECT ticket_id, MAX(fecha) AS fecha_cierre
            FROM ticket_movimiento
            WHERE movimiento_id = 5
            GROUP BY ticket_id
        ) cerrado ON creado.ticket_id = cerrado.ticket_id
        JOIN ticket t ON t.ticket_id = creado.ticket_id
        JOIN tipo_prioridad tp ON tp.prioridad_id = t.prioridad_id
        GROUP BY tp.prioridad_id
        ORDER BY tp.prioridad_id;
    `);

        return rows;
    },
    // HASTA AQUI LA VISTA GENERAL

    getUnidadesMes: async (year: number, month: number) => {
        // A) Obtenemos TODAS las unidades primero para asegurar la estructura
        const [unidades] = await pool.query<RowDataPacket[]>(`
            SELECT unidad_id, unidad FROM tipo_unidad
        `);

        // B) Miembros por unidad
        const [miembros] = await pool.query<RowDataPacket[]>(`
            SELECT unidad_id, COUNT(usuario_id) as total 
            FROM usuario 
            WHERE activo = 1 
            GROUP BY unidad_id
        `);

        // C) Pendientes (Estado Actual = 1)
        const [pendientes] = await pool.query<RowDataPacket[]>(`
            SELECT unidad_id, COUNT(*) AS total
            FROM ticket
            WHERE estado_id = 1
            GROUP BY unidad_id
        `);

        // D) En Proceso (Estado Actual = 2)
        const [enProceso] = await pool.query<RowDataPacket[]>(`
            SELECT unidad_id, COUNT(*) AS total
            FROM ticket
            WHERE estado_id = 2
            GROUP BY unidad_id
        `);

        // E) Cerrados en el mes seleccionado (Movimiento = 5 en fecha X)
        const [cerrados] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.unidad_id,
                COUNT(tm.ticket_id) AS total
            FROM ticket_movimiento tm
            JOIN ticket t ON t.ticket_id = tm.ticket_id
            WHERE tm.movimiento_id = 5 
                AND YEAR(tm.fecha) = ? 
                AND MONTH(tm.fecha) = ?
            GROUP BY t.unidad_id
        `, [year, month]);

        // F) MTTR Mensual (Tiempo promedio de resolución en horas)
        // Calculamos la diferencia entre CREACION (1) y CIERRE (5)
        const [mttr] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.unidad_id,
                ROUND(AVG(TIMESTAMPDIFF(MINUTE, inicio.fecha, fin.fecha)) / 60, 2) as horas_promedio
            FROM ticket t
            -- Join para fecha de inicio (ticket creado)
            JOIN ticket_movimiento inicio ON t.ticket_id = inicio.ticket_id AND inicio.movimiento_id = 1
            -- Join para fecha de fin (ticket cerrado) dentro del mes seleccionado
            JOIN ticket_movimiento fin ON t.ticket_id = fin.ticket_id AND fin.movimiento_id = 5
            WHERE YEAR(fin.fecha) = ? AND MONTH(fin.fecha) = ?
            GROUP BY t.unidad_id
        `, [year, month]);

        // G) UNIFICACIÓN DE DATOS
        const data = unidades.map(u => {
            const m = miembros.find(x => x.unidad_id === u.unidad_id);
            const p = pendientes.find(x => x.unidad_id === u.unidad_id);
            const ep = enProceso.find(x => x.unidad_id === u.unidad_id);
            const c = cerrados.find(x => x.unidad_id === u.unidad_id);
            const mt = mttr.find(x => x.unidad_id === u.unidad_id);

            return {
                unidad_id: u.unidad_id,
                unidad: u.unidad,
                miembros: m?.total || 0,
                pendientes: p?.total || 0,
                en_proceso: ep?.total || 0,
                cerrados: c?.total || 0,
                mttr_mensual: Number(mt?.horas_promedio || 0)
            };
        });

        return data;
    },
    getUnidadesAnual: async (year: number) => {

        // 1. Cerrados por Unidad agrupado por Mes
        const [cerrados] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.unidad_id,
                tu.unidad,
                COUNT(tm.ticket_id) AS cerrados
            FROM ticket_movimiento tm
            JOIN ticket t ON t.ticket_id = tm.ticket_id
            JOIN tipo_unidad tu ON t.unidad_id = tu.unidad_id
            WHERE tm.movimiento_id = 5 
                AND YEAR(tm.fecha) = ?
            GROUP BY t.unidad_id, tu.unidad
        `, [year]);

        // 2. MTTR Promedio ANUAL por unidad
        const [mttr] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.unidad_id,
                ROUND(AVG(TIMESTAMPDIFF(MINUTE, inicio.fecha, fin.fecha)) / 60, 2) as mttr_mensual
            FROM ticket t
            JOIN ticket_movimiento inicio ON t.ticket_id = inicio.ticket_id AND inicio.movimiento_id = 1
            JOIN ticket_movimiento fin ON t.ticket_id = fin.ticket_id AND fin.movimiento_id = 5
            WHERE YEAR(fin.fecha) = ?
            GROUP BY t.unidad_id
        `, [year]);

        return {
            cerrados, // Array con: { unidad_id, unidad, cerrados }
            mttr      // Array con: { unidad_id, mttr_mensual }
        };
    },
    getAvailableYears: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT DISTINCT YEAR(fecha) AS year
        FROM ticket_movimiento
        WHERE movimiento_id = 1
        ORDER BY year DESC;
    `);

        return rows.map(r => r.year);
    },
    // HASTA AQUI KPIS GENERALES POR UNIDAD

    getRendimientoEquipo: async (year: number, month: number) => {
        const [tecnicos] = await pool.query<RowDataPacket[]>(`
        SELECT 
            u.usuario_id,
            u.nombre_completo,
            tu.unidad,
            
            -- 1. OUTPUT: Tickets Resueltos en el mes (Movimiento = 5 'Cerrado')
            (SELECT COUNT(DISTINCT tm.ticket_id) 
            FROM ticket_movimiento tm 
            WHERE tm.usuario_id = u.usuario_id 
                AND tm.movimiento_id = 5
                AND YEAR(tm.fecha) = ? 
                AND MONTH(tm.fecha) = ?) AS tickets_resueltos,

            -- 2. INPUT: Tickets Asignados en ese mismo mes (Movimiento = 3 'Asignado' o 14 'Reasignado')
            -- Esto nos dice cuánto trabajo recibió el técnico en ese periodo específico
            (SELECT COUNT(DISTINCT tm.ticket_id) 
            FROM ticket_movimiento tm 
            WHERE tm.usuario_id = u.usuario_id 
                AND tm.movimiento_id IN (3, 14) 
                AND YEAR(tm.fecha) = ? 
                AND MONTH(tm.fecha) = ?) AS tickets_asignados_mes

        FROM usuario u
        JOIN tipo_unidad tu ON u.unidad_id = tu.unidad_id
        WHERE u.rol_id IN (2, 3) AND u.activo = 1
        ORDER BY tu.unidad, u.nombre_completo;
    `, [year, month, year, month]); // Pasamos los parámetros 4 veces (2 para cada subquery)

        return tecnicos;
    }
    // hasta aqui rendimineto por unidad 
}