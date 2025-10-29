import express from 'express';
// importamos los controladores
import { getUserId, getUsers, updateUserPassword, updateUserRole } from '../controllers/user.controller';
import { checkRole } from '../middlewares/checkRole';
import { verifyToken } from '../middlewares/verifyToken';

// inicializamos el router
const router = express.Router();


// Ruta de usuario p
router.get('/users/:id', getUserId); // listo
router.get('/users', getUsers) // list
router.patch('/users/:id', updateUserPassword) // pendiente
router.patch('/users/id', updateUserRole) // pendiente

router.get("/",verifyToken ,checkRole(["administrador"]), getUsers);




export default router;