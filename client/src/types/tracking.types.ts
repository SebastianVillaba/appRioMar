/**
 * Tipos TypeScript para el sistema de tracking - Frontend
 */

export interface Ubicacion {
  latitude: number;
  longitude: number;
  timestamp: Date;
  velocidad?: number;
  precision?: number;
}

export interface UsuarioTracking {
  id: number;
  username: string;
  ubicacion: Ubicacion | null;
  activo: boolean;
  ultimaActualizacion: Date;
}

export interface EventoUbicacion {
  userId: number;
  username?: string;
  lat: number;
  lng: number;
  timestamp: Date;
  velocidad?: number;
  precision?: number;
}

export interface HistorialUbicacion {
  id: number;
  userId: number;
  latitude: number;
  longitude: number;
  velocidad?: number;
  precision?: number;
  timestamp: Date;
}

// Estado de conexión Socket.io
export type EstadoConexion = 'conectado' | 'desconectado' | 'conectando' | 'error';

// Estado de geolocalización
export interface EstadoGeolocalizacion {
  activo: boolean;
  ubicacionActual: Ubicacion | null;
  error: string | null;
  cargando: boolean;
  permisosDenegados: boolean;
}

// Props de componentes
export interface MarkerUsuarioProps {
  userId: number;
  username: string;
  lat: number;
  lng: number;
  velocidad?: number;
  ultimaActualizacion: Date;
  onClick?: () => void;
}

export interface ListaUsuariosProps {
  usuarios: UsuarioTracking[];
  onUsuarioClick: (userId: number) => void;
  usuarioSeleccionado?: number;
}

export interface EstadoConexionProps {
  estado: EstadoConexion;
  ultimaActualizacion?: Date;
  onReconectar?: () => void;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface GuardarUbicacionRequest {
  lat: number;
  lng: number;
  velocidad?: number;
  precision?: number;
}

export interface ActualizarEstadoTrackingRequest {
  activo: boolean;
}

export interface UsuarioActivoResponse {
  userId: number;
  username: string;
  ultimaUbicacion: {
    latitude: number;
    longitude: number;
    velocidad?: number;
    timestamp: Date;
  } | null;
  activo: boolean;
}
