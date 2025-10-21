import { io, Socket } from 'socket.io-client';

// Singleton para la conexión Socket.io
let socket: Socket | null = null;

/**
 * Conecta al servidor Socket.io con autenticación JWT
 * @param token - Token JWT del usuario autenticado
 * @returns Instancia de Socket
 */
export const connectSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    console.log('Socket ya está conectado');
    return socket;
  }

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  // Eventos de conexión
  socket.on('connect', () => {
    console.log('✅ Conectado a Socket.io:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Desconectado de Socket.io:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión Socket.io:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Reconectado a Socket.io (intento ${attemptNumber})`);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Intentando reconectar... (intento ${attemptNumber})`);
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ Falló la reconexión a Socket.io');
  });

  return socket;
};

/**
 * Desconecta del servidor Socket.io
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket desconectado manualmente');
  }
};

/**
 * Obtiene la instancia actual del socket
 * @returns Instancia de Socket o null si no está conectado
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Verifica si el socket está conectado
 * @returns true si está conectado, false en caso contrario
 */
export const isSocketConnected = (): boolean => {
  return socket !== null && socket.connected;
};

/**
 * Emite un evento al servidor
 * @param event - Nombre del evento
 * @param data - Datos a enviar
 */
export const emitEvent = (event: string, data?: any): void => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn('⚠️ Socket no está conectado. No se puede emitir el evento:', event);
  }
};

/**
 * Escucha un evento del servidor
 * @param event - Nombre del evento
 * @param callback - Función callback a ejecutar cuando se reciba el evento
 */
export const onEvent = (event: string, callback: (...args: any[]) => void): void => {
  if (socket) {
    socket.on(event, callback);
  }
};

/**
 * Deja de escuchar un evento
 * @param event - Nombre del evento
 * @param callback - Función callback a remover (opcional)
 */
export const offEvent = (event: string, callback?: (...args: any[]) => void): void => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};
