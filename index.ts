import express from 'express';
import dotenv from 'dotenv';
import db from './db.config';
import userRoutes from './src/routes/user.route';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ruta para test de funcionamiento
app.get('/', (req, res) => {
    res.send('api-hospital-v1 funcionando correctamente');
});
// rutas de usuario
app.use('/api', userRoutes);

const startServer = async () => {
    try {
        await db; // asegurarse de que la DB esté conectada
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1); // salir si DB falla
    }
};

startServer();

