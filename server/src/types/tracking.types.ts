/**
 * Tipos TypeScript para el sistema de tracking
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

// Request types
export interface GuardarUbicacionRequest {
  lat: number;
  lng: number;
  velocidad?: number;
  precision?: number;
}

export interface ActualizarEstadoTrackingRequest {
  activo: boolean;
}

export interface ObtenerHistorialQuery {
  fechaInicio?: string;
  fechaFin?: string;
  limite?: number;
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface UbicacionGuardadaResponse {
  id: number;
  userId: number;
  latitude: number;
  longitude: number;
  velocidad?: number;
  timestamp: Date;
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
