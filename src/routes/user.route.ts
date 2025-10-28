import express from 'express';
// importamos los controladores
import { getUserId, getUsers, updateUserPassword, updateUserRole } from '../controllers/user.controller';

// inicializamos el router
const router = express.Router();


// Ruta de usuario p
router.get('/users/:id', getUserId); // listo
router.get('/users', getUsers) // list
router.patch('/users/:id', updateUserPassword) // pendiente
router.patch('/users/id', updateUserRole) // pendiente


export default router;