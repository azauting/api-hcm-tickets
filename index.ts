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
        // Verificamos la conexión a la base de datos antes de iniciar el servidor
        const conn = await db.getConnection();
        // Iniciamos el servidor
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
        // Liberamos la conexión a la base de datos
        conn.release();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1); // salir si DB falla
    }
};

startServer();

