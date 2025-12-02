import express from 'express';
import { userController } from './user.controller';
import { checkRole } from '../../middlewares/checkRole';
import { verifyToken } from '../../middlewares/verifyToken';


const router = express.Router();
// obtener usuarios solicitantes
router.get('/users/solicitantes', verifyToken, checkRole(['administrador']), userController.getRequestingUsers);
// obtener usuarios soportes
router.get('/users/soportes', verifyToken, checkRole(['administrador']), userController.getSupportUsers);
// crear usuario
router.post('/users', verifyToken, checkRole(['administrador']), userController.createUser);
// obtener usuario por id
router.get('/users/:id', userController.getUserById); 
// obtener soportes disponibles para asignar tickets

// actualizar al usuario
router.patch('/users/:id', verifyToken, checkRole(['administrador']), userController.updateUser);



export default router;