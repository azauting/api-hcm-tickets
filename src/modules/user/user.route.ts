import express from 'express';
import { getUserById, getUsers, updateUserPassword, updateUserRole } from './user.controller';
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

// router.get("/users",verifyToken, checkRole(["administrador", ), getUsers);



export default router;