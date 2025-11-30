
import pool from '../../config/db.config';
import type { RowDataPacket } from 'mysql2';
import { calculateJwkThumbprint } from 'jose';


export const kpiService = {

    // todo : KPIS POR DIA

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
            FROM ticket t
            WHERE NOT EXISTS (
                SELECT 1 FROM ticket_movimiento m
                WHERE m.ticket_id = t.ticket_id
                AND m.movimiento_id = 5
            );
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

    // todo: KPI POR UNIDAD 

    getTicketsCreatedTodayByUnit: async () => {
        const query = `
            SELECT tu.unidad, COUNT(*) AS creados_hoy
            FROM ticket t
            JOIN tipo_unidad tu ON tu.unidad_id = t.unidad_id
            JOIN ticket_movimiento m ON m.ticket_id = t.ticket_id
            WHERE m.movimiento_id = 1
            AND DATE(m.fecha) = CURDATE()
            GROUP BY tu.unidad;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    getTicketsThisMonthByUnit: async () => {
        const query = `
            SELECT tu.unidad, COUNT(*) AS total_mes
            FROM ticket t
            JOIN tipo_unidad tu ON tu.unidad_id = t.unidad_id
            JOIN ticket_movimiento m ON m.ticket_id = t.ticket_id
            WHERE m.movimiento_id = 1
            AND MONTH(m.fecha) = MONTH(CURDATE())
            GROUP BY tu.unidad;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    getMTTRByUnit: async () => {
        const query = `
            SELECT 
                tu.unidad,
                ROUND(AVG(TIMESTAMPDIFF(HOUR, creado.fecha, cerrado.fecha)), 2) AS mttr_horas
            FROM ticket t
            JOIN tipo_unidad tu ON tu.unidad_id = t.unidad_id
            JOIN ticket_movimiento creado ON creado.ticket_id = t.ticket_id AND creado.movimiento_id = 1
            JOIN ticket_movimiento cerrado ON cerrado.ticket_id = t.ticket_id AND cerrado.movimiento_id = 5
            GROUP BY tu.unidad;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    getClosedTicketsByUnit: async () => {
        const query = `
            SELECT tu.unidad, COUNT(*) AS cerrados
            FROM ticket t
            JOIN tipo_unidad tu ON tu.unidad_id = t.unidad_id
            JOIN ticket_movimiento m ON m.ticket_id = t.ticket_id
            WHERE m.movimiento_id = 5
            GROUP BY tu.unidad;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    getOpenTicketsByUnit: async () => {
        const query = `
            SELECT tu.unidad, COUNT(*) AS abiertos
            FROM ticket t
            JOIN tipo_unidad tu ON tu.unidad_id = t.unidad_id
            WHERE NOT EXISTS (
                SELECT 1 FROM ticket_movimiento m
                WHERE m.ticket_id = t.ticket_id AND m.movimiento_id = 5
            )
            GROUP BY tu.unidad;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    getTicketsInProgressByUnit: async () => {
        const query = `
            SELECT tu.unidad, COUNT(*) AS en_proceso
            FROM ticket t
            JOIN tipo_unidad tu ON tu.unidad_id = t.unidad_id
            WHERE t.ticket_id IN (
                SELECT ticket_id FROM ticket_movimiento WHERE movimiento_id = 3
            )
            AND t.ticket_id NOT IN (
                SELECT ticket_id FROM ticket_movimiento WHERE movimiento_id = 5
            )
            GROUP BY tu.unidad;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    // todo : RENDIMIENTO SOPORTE

    getSupportPerformance: async () => {
        const query = `
            SELECT 
                u.usuario_id,
                u.nombre_completo AS soporte,
                COUNT(*) AS tickets_resueltos
            FROM ticket_movimiento m
            JOIN usuario u ON u.usuario_id = m.usuario_id
            WHERE m.movimiento_id = 5
            AND u.rol_id = 2
            GROUP BY u.usuario_id
            ORDER BY tickets_resueltos DESC;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },
    getTicketsByDay: async () => {
        const query = `
            SELECT 
                DATE(m.fecha) AS fecha,
                COUNT(*) AS total_tickets
            FROM ticket_movimiento m
            WHERE m.movimiento_id = 1
            GROUP BY DATE(m.fecha)
            ORDER BY fecha;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    getTicketsByWeek: async () => {
        const query = `
            SELECT
                YEAR(m.fecha) AS year,
                WEEK(m.fecha, 1) AS week,
                COUNT(*) AS total_tickets
            FROM ticket_movimiento m
            WHERE m.movimiento_id = 1
            GROUP BY year, week
            ORDER BY year, week;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    getTicketsByMonth: async () => {
        const query = `
            SELECT
                YEAR(m.fecha) AS year,
                MONTH(m.fecha) AS month,
                COUNT(*) AS total_tickets
            FROM ticket_movimiento m
            WHERE m.movimiento_id = 1
            GROUP BY year, month
            ORDER BY year, month;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    getTicketsByYear: async () => {
        const query = `
            SELECT
                YEAR(m.fecha) AS year,
                COUNT(*) AS total_tickets
            FROM ticket_movimiento m
            WHERE m.movimiento_id = 1
            GROUP BY year
            ORDER BY year;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    },

    // todo : MTTR (TIEMPO MEDIO DE RESOLUCION)

    getMTTR: async () => {
        const query = `
            SELECT 
                    AVG(TIMESTAMPDIFF(HOUR, t_crea.fecha_creacion, t_cierra.fecha_cierre)) AS MTTR_horas
                FROM 
                    (SELECT ticket_id, MIN(fecha) AS fecha_creacion
                    FROM ticket_movimiento
                    GROUP BY ticket_id) AS t_crea
                JOIN 
                    (SELECT ticket_id, fecha AS fecha_cierre
                    FROM ticket_movimiento
                    WHERE movimiento_id = 5) AS t_cierra
                ON t_crea.ticket_id = t_cierra.ticket_id;
            `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows[0] || { MTTR_horas: 0 };
    },


    // TODO : KPIS AGUS
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
            `SELECT
                MONTHNAME(cerrado.fecha) AS mes,
                ROUND(AVG(TIMESTAMPDIFF(HOUR, creado.fecha, cerrado.fecha)), 2) AS mttr_horas
            FROM ticket_movimiento creado
            JOIN ticket_movimiento cerrado
                ON creado.ticket_id = cerrado.ticket_id
            WHERE creado.movimiento_id = 1
            AND cerrado.movimiento_id = 5
            GROUP BY MONTH(cerrado.fecha)
            ORDER BY MONTH(cerrado.fecha);`
        );
        return rows;
    },
    getUnitConsolidatedStats: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                tu.unidad,
                SUM(CASE WHEN t.estado_id != 5 THEN 1 ELSE 0 END) AS pendientes,
                SUM(CASE WHEN EXISTS (
                        SELECT 1 FROM ticket_movimiento m 
                        WHERE m.ticket_id = t.ticket_id 
                        AND m.movimiento_id = 3
                    ) THEN 1 ELSE 0 END) AS en_proceso,
                SUM(CASE WHEN EXISTS (
                        SELECT 1 FROM ticket_movimiento m 
                        WHERE m.ticket_id = t.ticket_id 
                        AND m.movimiento_id = 5
                    ) THEN 1 ELSE 0 END) AS cerrados,
                (
                    SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR, creado.fecha, cerrado.fecha)), 2)
                    FROM ticket_movimiento creado
                    JOIN ticket_movimiento cerrado
                        ON creado.ticket_id = cerrado.ticket_id
                    WHERE creado.movimiento_id = 1
                    AND cerrado.movimiento_id = 5
                    AND t.unidad_id = tu.unidad_id
                ) AS mttr_horas
            FROM ticket t
            JOIN tipo_unidad tu ON tu.unidad_id = t.unidad_id
            GROUP BY tu.unidad_id
            ORDER BY tu.unidad;`
        );
        return rows;
    },
    getMonthlyResolvedTicketsByUnit: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                MONTHNAME(m.fecha) AS mes,
                tu.unidad AS unidad,
                COUNT(*) AS total_resueltos
            FROM ticket_movimiento m
            JOIN ticket t ON t.ticket_id = m.ticket_id
            JOIN tipo_unidad tu ON tu.unidad_id = t.unidad_id
            WHERE m.movimiento_id = 5
            GROUP BY mes, tu.unidad
            ORDER BY MONTH(m.fecha);`
        );

        const resultMap: Record<string, any> = {};

        for (const row of rows) {
            const mes = row.mes;

            if (!resultMap[mes]) {
                resultMap[mes] = {
                    mes,
                    soporte: 0,
                    desarrollo: 0,
                    infraestructura: 0
                };
            }

            const unidadLower = row.unidad.toLowerCase();

            if (unidadLower === "soporte") resultMap[mes].soporte = row.total_resueltos;
            if (unidadLower === "desarrollo") resultMap[mes].desarrollo = row.total_resueltos;
            if (unidadLower === "infraestructura") resultMap[mes].infraestructura = row.total_resueltos;
        }

        return Object.values(resultMap);
    },

    getMTTRComparisonByUnit: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
                tu.unidad,
                ROUND(AVG(TIMESTAMPDIFF(HOUR, creado.fecha, cerrado.fecha)), 2) AS promedio_horas
            FROM ticket_movimiento creado
            JOIN ticket_movimiento cerrado
                ON creado.ticket_id = cerrado.ticket_id
            JOIN ticket t ON t.ticket_id = creado.ticket_id
            JOIN tipo_unidad tu ON tu.unidad_id = t.unidad_id
            WHERE creado.movimiento_id = 1
            AND cerrado.movimiento_id = 5
            GROUP BY tu.unidad;`
        );
        return rows;
    },
    getMTTRByPriority: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                tp.prioridad,
                ROUND(AVG(TIMESTAMPDIFF(HOUR, creado.fecha, cerrado.fecha)), 2) AS mttr_horas
            FROM ticket_movimiento creado
            JOIN ticket_movimiento cerrado 
                ON creado.ticket_id = cerrado.ticket_id
            JOIN ticket t ON t.ticket_id = creado.ticket_id
            JOIN tipo_prioridad tp ON tp.prioridad_id = t.prioridad_id
            WHERE creado.movimiento_id = 1
            AND cerrado.movimiento_id = 5
            GROUP BY tp.prioridad_id;`
        );
        return rows;
    },
    getSupportFullPerformance: async () => {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
                u.usuario_id AS id,
                u.nombre_completo AS nombre,
                tu.unidad,
                -- tickets resueltos
                (SELECT COUNT(*)
                FROM ticket_movimiento m
                WHERE m.movimiento_id = 5
                AND m.usuario_id = u.usuario_id) AS tickets_resueltos,
                (SELECT COUNT(*)
                FROM ticket_detalle td
                WHERE td.soporte_asignado = u.usuario_id) AS asignados_actuales,
                ROUND(
                    (
                        (SELECT COUNT(*) FROM ticket_movimiento m WHERE m.movimiento_id = 5 AND m.usuario_id = u.usuario_id)
                        /
                        NULLIF(
                            (SELECT COUNT(*) FROM ticket_detalle td WHERE td.soporte_asignado = u.usuario_id)
                            ,0
                        )
                    ) * 100, 0
                ) AS eficacia
            FROM usuario u
            JOIN tipo_unidad tu ON tu.unidad_id = u.unidad_id
            WHERE u.rol_id = 2;`
        );
        return rows;
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
    }













}