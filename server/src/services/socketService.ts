import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

// Interfaz para datos de usuario autenticado
interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

// Almacenar usuarios conectados en memoria
// En producción, considerar usar Redis para múltiples instancias
const usuariosConectados = new Map<number, {
  socketId: string;
  username: string;
  rol: string;
  conectadoEn: Date;
}>();

let ioInstance: Server;

/**
 * Inicializa Socket.io con manejo de eventos
 * @param io - Instancia de Socket.io Server
 */
export const initializeSocket = (io: Server): void => {
  ioInstance = io;

  // Middleware de autenticación Socket.io
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        id: number;
        username: string;
        rol: string;
      };

      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ Usuario conectado: ${socket.username} (ID: ${socket.userId})`);

    // Guardar usuario conectado
    if (socket.userId && socket.username) {
      usuariosConectados.set(socket.userId, {
        socketId: socket.id,
        username: socket.username,
        rol: 'chofer', // Por ahora todos son choferes
        conectadoEn: new Date()
      });
    }

    // Evento: Usuario se identifica como chofer
    socket.on('chofer:conectado', () => {
      socket.join('choferes');
      console.log(`🚗 Chofer ${socket.username} unido a room 'choferes'`);
      
      // Notificar a monitores que hay un nuevo chofer
      io.to('monitores').emit('chofer:nuevo', {
        userId: socket.userId,
        username: socket.username,
        conectadoEn: new Date()
      });
    });

    // Evento: Usuario se identifica como monitor
    socket.on('monitor:conectado', () => {
      socket.join('monitores');
      console.log(`👁️ Monitor ${socket.username} unido a room 'monitores'`);
      
      // Enviar lista de choferes activos al monitor
      const choferesActivos = Array.from(usuariosConectados.entries()).map(([id, data]) => ({
        userId: id,
        username: data.username,
        conectadoEn: data.conectadoEn
      }));
      
      socket.emit('monitores:choferes-activos', choferesActivos);
    });

    // Evento: Chofer envía su ubicación
    socket.on('chofer:ubicacion', (data: {
      lat: number;
      lng: number;
      velocidad?: number;
      timestamp: Date;
    }) => {
      console.log(`📍 Ubicación recibida de ${socket.username}:`, data);

      // Broadcast a todos los monitores
      io.to('monitores').emit('ubicacion:actualizada', {
        userId: socket.userId,
        username: socket.username,
        lat: data.lat,
        lng: data.lng,
        velocidad: data.velocidad,
        timestamp: data.timestamp
      });
    });

    // Evento: Monitor solicita historial de un chofer
    socket.on('monitor:solicitar-historial', (data: { userId: number }) => {
      console.log(`📊 Monitor ${socket.username} solicita historial de usuario ${data.userId}`);
      // Este evento se manejará con la API REST
      // Aquí solo confirmamos la recepción
      socket.emit('monitor:historial-solicitado', { userId: data.userId });
    });

    // Evento: Desconexión
    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${socket.username} (ID: ${socket.userId})`);
      
      if (socket.userId) {
        usuariosConectados.delete(socket.userId);
        
        // Notificar a monitores que el chofer se desconectó
        io.to('monitores').emit('chofer:desconectado', {
          userId: socket.userId,
          username: socket.username,
          desconectadoEn: new Date()
        });
      }
    });

    // Evento: Error
    socket.on('error', (error) => {
      console.error(`❌ Error en socket ${socket.username}:`, error);
    });
  });

  console.log('🔌 Socket.io inicializado correctamente');
};

/**
 * Obtiene la instancia de Socket.io
 * @returns Instancia de Socket.io Server
 */
export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.io no ha sido inicializado');
  }
  return ioInstance;
};

/**
 * Obtiene usuarios conectados actualmente
 * @returns Map de usuarios conectados
 */
export const getUsuariosConectados = () => {
  return usuariosConectados;
};

/**
 * Emite un evento a un usuario específico
 * @param userId - ID del usuario
 * @param event - Nombre del evento
 * @param data - Datos a enviar
 */
export const emitToUser = (userId: number, event: string, data: any) => {
  const usuario = usuariosConectados.get(userId);
  if (usuario) {
    ioInstance.to(usuario.socketId).emit(event, data);
  }
};

/**
 * Emite un evento a todos los monitores
 * @param event - Nombre del evento
 * @param data - Datos a enviar
 */
export const emitToMonitores = (event: string, data: any) => {
  ioInstance.to('monitores').emit(event, data);
};

/**
 * Emite un evento a todos los choferes
 * @param event - Nombre del evento
 * @param data - Datos a enviar
 */
export const emitToChoferes = (event: string, data: any) => {
  ioInstance.to('choferes').emit(event, data);
};
