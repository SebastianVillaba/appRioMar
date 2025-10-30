import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { initializeSocket } from './services/socketService';

// Cargar variables de entorno
dotenv.config();

const rawAllowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173').split(',');

const allowedOrigins = String(rawAllowedOrigins).split(',').map((url: string) => url.trim());

const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};

// Crear aplicación Express
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Crear servidor HTTP
const httpServer = createServer(app);

// Configurar Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Inicializar Socket.io
initializeSocket(io);

// Middlewares
app.use(helmet()); // Seguridad HTTP headers
app.use(cors(corsOptions)); // Habilitar CORS
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
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.io habilitado`);
});

export default app;
export { io };
