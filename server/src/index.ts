import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet()); // Seguridad HTTP headers
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parser de JSON
app.use(express.urlencoded({ extended: true })); // Parser de URL-encoded

// Ruta de prueba
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '¡Servidor Express con TypeScript funcionando!',
    timestamp: new Date().toISOString(),
  });
});

// Ruta de health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Rutas de la API
app.use('/api', routes);

// Manejo de rutas no encontradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Manejo de errores global
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Modo: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
