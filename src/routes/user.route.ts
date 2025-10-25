import express from 'express';
// importamos los controladores
import { getUserId, getUsers, updateUser } from '../controllers/user.controller';

// inicializamos el router
const router = express.Router();


// Ruta de usuario para obtener información del usuario especificado por ID
router.get('/users/:id', getUserId);
// Ruta de usuario para obtener todos los usuarios
router.get('/users', getUsers) // getUsers --- TO BE IMPLEMENTED ---
// Ruta para actualizar la información del usuario especificado por ID
router.put('/users/:id', updateUser) // updateUser --- TO BE IMPLEMENTED ---


export default router;