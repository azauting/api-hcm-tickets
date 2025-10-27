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
    log.info(`Obteniendo usuario con ID: ${userId}`);

    const [result] = await pool.query('SELECT * FROM usuario WHERE usuario_id = ?', [userId]);
    const users = result as User[];
    const user = users[0];

    if (!user) {
        log.warn(`Usuario con ID ${userId} no encontrado`);
        return undefined;
    }

    log.info(`Usuario con ID ${userId} obtenido con éxito`);
    return user;
};

// Servicio para obtener todos los usuarios
export const getAllUsers = async (): Promise<User> => {
    // Inicializamos el logger para la acción de obtención de todos los usuarios
    const log = logger().child({ action: 'getAllUsers' });

    log.info('Obteniendo todos los usuarios desde la base de datos');

    const [result] = await pool.query('SELECT * FROM usuario');
    const users = result as User[];

    if (users.length === 0) {
        log.warn('No se encontraron usuarios en la base de datos');
    } else {
        log.info(`Se obtuvieron ${users.length} usuarios correctamente`);
    }

    return users;
};
