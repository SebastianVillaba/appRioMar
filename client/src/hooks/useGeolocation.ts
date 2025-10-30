import { useState, useEffect, useCallback, useRef } from 'react';
import type { Ubicacion } from '../types/tracking.types';

interface UseGeolocationReturn {
  ubicacion: Ubicacion | null;
  error: string | null;
  cargando: boolean;
  permisosDenegados: boolean;
  iniciarTracking: () => void;
  detenerTracking: () => void;
  isTracking: boolean;
}

/**
 * Hook personalizado para obtener la geolocalización del dispositivo
 * Usa navigator.geolocation.watchPosition() para tracking continuo
 */
export const useGeolocation = (): UseGeolocationReturn => {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [permisosDenegados, setPermisosDenegados] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  const detenerTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
      console.log('📍 Tracking de geolocalización detenido');
    }
  }, []);

  const iniciarTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada en este navegador');
      return;
    }

    if (isTracking) {
      console.log('⚠️ El tracking ya está activo');
      return;
    }

    setCargando(true);
    setError(null);
    setPermisosDenegados(false);

    const options: PositionOptions = {
      enableHighAccuracy: true, // Usar GPS si está disponible
      timeout: 10000, // 10 segundos de timeout
      maximumAge: 0 // No usar caché
    };

    const onSuccess = (position: GeolocationPosition) => {
      const nuevaUbicacion: Ubicacion = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date(position.timestamp),
        velocidad: position.coords.speed !== null ? position.coords.speed : undefined,
        precision: position.coords.accuracy
      };

      setUbicacion(nuevaUbicacion);
      setCargando(false);
      setError(null);
      console.log('📍 Ubicación actualizada:', nuevaUbicacion);
    };

    const onError = (err: GeolocationPositionError) => {
      setCargando(false);
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Permisos de geolocalización denegados');
          setPermisosDenegados(true);
          detenerTracking();
          break;
        case err.POSITION_UNAVAILABLE:
          setError('Ubicación no disponible');
          break;
        case err.TIMEOUT:
          setError('Tiempo de espera agotado al obtener ubicación');
          break;
        default:
          setError('Error desconocido al obtener ubicación');
      }
      
      console.error('❌ Error de geolocalización:', err.message);
    };

    // Iniciar tracking continuo
    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      options
    );

    setIsTracking(true);
    console.log('📍 Tracking de geolocalización iniciado');
  }, [isTracking, detenerTracking]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      detenerTracking();
    };
  }, [detenerTracking]);

  return {
    ubicacion,
    error,
    cargando,
    permisosDenegados,
    iniciarTracking,
    detenerTracking,
    isTracking
  };
};
