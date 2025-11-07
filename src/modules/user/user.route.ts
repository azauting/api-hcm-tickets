import express from 'express';
import { getUserById, getUsers, updateUserPassword, updateUserRole } from './user.controller';
import { checkRole } from '../../middlewares/checkRole';
import { verifyToken } from '../../middlewares/verifyToken';

// inicializamos el router
const router = express.Router();

router.get('/users/:id', getUserById); // listo
router.get('/users', getUsers) // listo
router.patch('/users/:id', updateUserPassword) // pendiente
router.patch('/users/id', updateUserRole) // pendiente

// router.get("/users",verifyToken, checkRole(["administrador", ), getUsers);



export default router;