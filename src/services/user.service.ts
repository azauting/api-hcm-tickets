import logger from 'pino'
import type { User } from '../types/user.type'
import pool from '../../db.config'
import { useActionState } from 'react';

const getUserFromDB = async (userId: number): Promise<User | undefined> => {
    // Realizamos la consulta a la base de datos para obtener el usuario por ID
    const [rows] = await pool.query('SELECT * FROM usuario WHERE usuario_id = ?', [userId]);
    // Devolvemos el usuario encontrado
    return (rows as User[])[0];
}

//servicio para obtener un usuario por ID
export const getUser = async (userId: number): Promise<User> => {
    // Inicializamos el logger con el ID del usuario
    const log = logger().child({ userId });
    // Registramos el inicio del proceso de obtención del usuario
    log.info(`Obteniendo usuario con ID: ${userId}`);
    // Obtenemos el usuario desde la base de datos
    const user = await getUserFromDB(userId);
    // Si no se encuentra el usuario, lanzamos un error en el sistema de logs
    if (!user) {
        log.error(`Usuario con ID ${userId} no encontrado`);
    } else {
        log.info(`Usuario con ID ${userId} obtenido con éxito`);
    }
    return user as User;
};

// Servicio para obtener todos los usuarios
export const getAllUsers = async (): Promise<User> => {
    // Inicializamos el logger para la acción de obtención de todos los usuarios
    const log = logger().child({ action: 'getAllUsers' });

    log.info('Obteniendo todos los usuarios desde la base de datos');

    // hacemos la consulta a la base de datos para obtener todos los usuarios
    const [rows] = await pool.query('SELECT * FROM usuario') as [User[], any];

    if (rows.length === 0) {
        log.error('No se encontraron usuarios en la base de datos');
    } else {
        log.info(`Se obtuvieron ${rows.length} usuarios correctamente`);
    }
    return rows
}; 