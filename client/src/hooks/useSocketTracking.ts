import { useState, useEffect, useCallback, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket, onEvent, offEvent, emitEvent } from '../services/socketService';
import type { UsuarioTracking, EventoUbicacion, EstadoConexion } from '../types/tracking.types';

interface UseSocketTrackingReturn {
  usuarios: UsuarioTracking[];
  conectado: boolean;
  estadoConexion: EstadoConexion;
  error: string | null;
  conectar: (token: string) => void;
  desconectar: () => void;
  enviarUbicacion: (ubicacion: EventoUbicacion) => void;
  identificarseComoChofer: () => void;
  identificarseComoMonitor: () => void;
}

/**
 * Hook personalizado para manejar la conexión Socket.io y eventos de tracking
 */
export const useSocketTracking = (): UseSocketTrackingReturn => {
  const [usuarios, setUsuarios] = useState<UsuarioTracking[]>([]);
  const [conectado, setConectado] = useState<boolean>(false);
  const [estadoConexion, setEstadoConexion] = useState<EstadoConexion>('desconectado');
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<ReturnType<typeof getSocket>>(null);

  // Manejadores de eventos Socket.io
  const handleConnect = useCallback(() => {
    console.log('✅ Socket conectado');
    setConectado(true);
    setEstadoConexion('conectado');
    setError(null);
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    console.log('❌ Socket desconectado:', reason);
    setConectado(false);
    setEstadoConexion('desconectado');
  }, []);

  const handleConnectError = useCallback((err: Error) => {
    console.error('❌ Error de conexión Socket:', err.message);
    setConectado(false);
    setEstadoConexion('error');
    setError(err.message);
  }, []);

  const handleReconnect = useCallback(() => {
    console.log('🔄 Socket reconectado');
    setConectado(true);
    setEstadoConexion('conectado');
    setError(null);
  }, []);

  // Evento: Ubicación actualizada de un chofer
  const handleUbicacionActualizada = useCallback((data: EventoUbicacion) => {
    console.log('📍 Ubicación actualizada recibida:', data);
    
    setUsuarios(prevUsuarios => {
      const usuarioExistente = prevUsuarios.find(u => u.id === data.userId);
      
      if (usuarioExistente) {
        // Actualizar usuario existente
        return prevUsuarios.map(u => 
          u.id === data.userId
            ? {
                ...u,
                ubicacion: {
                  latitude: data.lat,
                  longitude: data.lng,
                  timestamp: new Date(data.timestamp),
                  velocidad: data.velocidad
                },
                ultimaActualizacion: new Date(data.timestamp),
                activo: true
              }
            : u
        );
      } else {
        // Agregar nuevo usuario
        return [
          ...prevUsuarios,
          {
            id: data.userId,
            username: data.username || `Usuario ${data.userId}`,
            ubicacion: {
              latitude: data.lat,
              longitude: data.lng,
              timestamp: new Date(data.timestamp),
              velocidad: data.velocidad
            },
            ultimaActualizacion: new Date(data.timestamp),
            activo: true
          }
        ];
      }
    });
  }, []);

  // Evento: Nuevo chofer conectado
  const handleChoferNuevo = useCallback((data: { userId: number; username: string; conectadoEn: Date }) => {
    console.log('🚗 Nuevo chofer conectado:', data);
    
    setUsuarios(prevUsuarios => {
      const existe = prevUsuarios.find(u => u.id === data.userId);
      if (!existe) {
        return [
          ...prevUsuarios,
          {
            id: data.userId,
            username: data.username,
            ubicacion: null,
            activo: true,
            ultimaActualizacion: new Date(data.conectadoEn)
          }
        ];
      }
      return prevUsuarios;
    });
  }, []);

  // Evento: Chofer desconectado
  const handleChoferDesconectado = useCallback((data: { userId: number }) => {
    console.log('❌ Chofer desconectado:', data);
    
    setUsuarios(prevUsuarios =>
      prevUsuarios.map(u =>
        u.id === data.userId
          ? { ...u, activo: false }
          : u
      )
    );
  }, []);

  // Evento: Lista de choferes activos (al conectarse como monitor)
  const handleChoferesActivos = useCallback((choferes: any[]) => {
    console.log('📋 Choferes activos recibidos:', choferes);
    
    const usuariosActivos: UsuarioTracking[] = choferes.map(chofer => ({
      id: chofer.userId,
      username: chofer.username,
      ubicacion: null,
      activo: true,
      ultimaActualizacion: new Date(chofer.conectadoEn)
    }));
    
    setUsuarios(usuariosActivos);
  }, []);

  // Conectar al servidor Socket.io
  const conectar = useCallback((token: string) => {
    if (socketRef.current) {
      console.log('⚠️ Socket ya está conectado');
      return;
    }

    setEstadoConexion('conectando');
    
    try {
      const socket = connectSocket(token);
      socketRef.current = socket;

      // Registrar event listeners
      onEvent('connect', handleConnect);
      onEvent('disconnect', handleDisconnect);
      onEvent('connect_error', handleConnectError);
      onEvent('reconnect', handleReconnect);
      onEvent('ubicacion:actualizada', handleUbicacionActualizada);
      onEvent('chofer:nuevo', handleChoferNuevo);
      onEvent('chofer:desconectado', handleChoferDesconectado);
      onEvent('monitores:choferes-activos', handleChoferesActivos);
    } catch (err) {
      console.error('Error al conectar Socket:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setEstadoConexion('error');
    }
  }, [
    handleConnect,
    handleDisconnect,
    handleConnectError,
    handleReconnect,
    handleUbicacionActualizada,
    handleChoferNuevo,
    handleChoferDesconectado,
    handleChoferesActivos
  ]);

  // Desconectar del servidor Socket.io
  const desconectar = useCallback(() => {
    if (!socketRef.current) {
      return;
    }

    // Remover event listeners
    offEvent('connect', handleConnect);
    offEvent('disconnect', handleDisconnect);
    offEvent('connect_error', handleConnectError);
    offEvent('reconnect', handleReconnect);
    offEvent('ubicacion:actualizada', handleUbicacionActualizada);
    offEvent('chofer:nuevo', handleChoferNuevo);
    offEvent('chofer:desconectado', handleChoferDesconectado);
    offEvent('monitores:choferes-activos', handleChoferesActivos);

    disconnectSocket();
    socketRef.current = null;
    setConectado(false);
    setEstadoConexion('desconectado');
    setUsuarios([]);
  }, [
    handleConnect,
    handleDisconnect,
    handleConnectError,
    handleReconnect,
    handleUbicacionActualizada,
    handleChoferNuevo,
    handleChoferDesconectado,
    handleChoferesActivos
  ]);

  // Enviar ubicación al servidor
  const enviarUbicacion = useCallback((ubicacion: EventoUbicacion) => {
    if (!conectado) {
      console.warn('⚠️ No se puede enviar ubicación: Socket no conectado');
      return;
    }

    emitEvent('chofer:ubicacion', ubicacion);
  }, [conectado]);

  // Identificarse como chofer
  const identificarseComoChofer = useCallback(() => {
    if (!conectado) {
      console.warn('⚠️ No se puede identificar como chofer: Socket no conectado');
      return;
    }

    emitEvent('chofer:conectado');
    console.log('🚗 Identificado como chofer');
  }, [conectado]);

  // Identificarse como monitor
  const identificarseComoMonitor = useCallback(() => {
    if (!conectado) {
      console.warn('⚠️ No se puede identificar como monitor: Socket no conectado');
      return;
    }

    emitEvent('monitor:conectado');
    console.log('👁️ Identificado como monitor');
  }, [conectado]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      desconectar();
    };
  }, [desconectar]);

  return {
    usuarios,
    conectado,
    estadoConexion,
    error,
    conectar,
    desconectar,
    enviarUbicacion,
    identificarseComoChofer,
    identificarseComoMonitor
  };
};
