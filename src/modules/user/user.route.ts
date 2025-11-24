import express from 'express';
import { getUserById, getUsers, updateUserPassword, getAvailableSupports } from './user.controller';
import { checkRole } from '../../middlewares/checkRole';
import { verifyToken } from '../../middlewares/verifyToken';

// inicializamos el router
const router = express.Router();

// obtener los usuarios
router.get('/users', getUsers) // listo
// obtener el usuario por id
router.get('/users/:id', getUserById); // listo
// actualizar el usuario rol/unidad/contrasena
router.patch('/users/:id', updateUserPassword) // pendiente

// ruta para ver los soportes que no tienen un ticket asignado
router.get('/user/soportes-disponibles', verifyToken, checkRole(['administrador']), getAvailableSupports);

// router.get("/users",verifyToken, checkRole(["administrador", ), getUsers);



export default router;