import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';
import {
  GuardarUbicacionRequest,
  ActualizarEstadoTrackingRequest,
  ObtenerHistorialQuery,
  ApiResponse,
  UbicacionGuardadaResponse,
  UsuarioActivoResponse
} from '../types/tracking.types';
import { emitToMonitores } from '../services/socketService';

/**
 * Guarda una nueva ubicación del usuario
 * También actualiza el estado de tracking y notifica a monitores vía Socket.io
 */
export const guardarUbicacion = async (
  req: Request<{}, {}, GuardarUbicacionRequest>,
  res: Response<ApiResponse<UbicacionGuardadaResponse>>
): Promise<void> => {
  try {
    const { lat, lng, velocidad, precision } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Validar coordenadas
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Coordenadas inválidas'
      });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({
        success: false,
        message: 'Coordenadas fuera de rango'
      });
      return;
    }

    // Guardar en base de datos
    const result = await executeRequest({
      query: 'sp_guardar_ubicacion',
      inputs: [
        { name: 'user_id', type: sql.Int(), value: userId }, // CORRECCIÓN: sql.Int()
        { name: 'latitude', type: sql.Decimal(10, 8), value: lat },
        { name: 'longitude', type: sql.Decimal(11, 8), value: lng },
        { name: 'velocidad', type: sql.Decimal(6, 2), value: velocidad || null },
        { name: 'precision_metros', type: sql.Decimal(8, 2), value: precision || null }
      ],
      isStoredProcedure: true
    });

    const ubicacionGuardada = result.recordset[0];

    // Emitir evento a monitores vía Socket.io
    try {
      emitToMonitores('ubicacion:actualizada', {
        userId,
        username: (req as any).user?.username,
        lat,
        lng,
        velocidad,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Error al emitir evento Socket.io:', socketError);
      // No fallar la petición si falla Socket.io
    }

    res.status(201).json({
      success: true,
      message: 'Ubicación guardada exitosamente',
      data: ubicacionGuardada
    });
  } catch (error) {
    console.error('Error en guardarUbicacion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar ubicación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtiene la lista de usuarios con tracking activo
 * Incluye su última ubicación conocida
 */
export const obtenerUbicacionesActivas = async (
  _req: Request,
  res: Response<ApiResponse<UsuarioActivoResponse[]>>
): Promise<void> => {
  try {
    const result = await executeRequest({
      query: 'sp_obtener_usuarios_activos',
      isStoredProcedure: true
    });

    const usuariosActivos = result.recordset.map((row: any) => ({
      userId: row.userId,
      username: row.username,
      ultimaUbicacion: row.latitude && row.longitude ? {
        latitude: row.latitude,
        longitude: row.longitude,
        velocidad: row.velocidad,
        timestamp: row.timestamp
      } : null,
      activo: row.activo
    }));

    res.status(200).json({
      success: true,
      message: 'Usuarios activos obtenidos exitosamente',
      data: usuariosActivos
    });
  } catch (error) {
    console.error('Error en obtenerUbicacionesActivas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ubicaciones activas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Obtiene el historial de ubicaciones de un usuario específico
 * Permite filtrar por rango de fechas
 */
export const obtenerHistorialUsuario = async (
  req: Request<{ userId: string }, {}, {}, ObtenerHistorialQuery>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { fechaInicio, fechaFin, limite } = req.query;

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
      return;
    }

    const inputs: any[] = [
      { name: 'user_id', type: sql.Int, value: userIdNum }
    ];

    if (fechaInicio) {
      inputs.push({ name: 'fecha_inicio', type: sql.DateTime2, value: new Date(fechaInicio) });
    }

    if (fechaFin) {
      inputs.push({ name: 'fecha_fin', type: sql.DateTime2, value: new Date(fechaFin) });
    }

    if (limite) {
      const limiteStr = Array.isArray(limite) ? limite[0] : String(limite);
      const limiteNum = parseInt(limiteStr);
      
      if (!isNaN(limiteNum) && limiteNum > 0) {
        inputs.push({ name: 'limite', type: sql.Int(), value: limiteNum }); // CORRECCIÓN: sql.Int()
      }
    }

    const result = await executeRequest({
      query: 'sp_obtener_historial_usuario',
      inputs,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      message: 'Historial obtenido exitosamente',
      data: result.recordset
    });
  } catch (error) {
    console.error('Error en obtenerHistorialUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualiza el estado de tracking de un usuario (activo/inactivo)
 */
export const actualizarEstadoTracking = async (
  req: Request<{}, {}, ActualizarEstadoTrackingRequest>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { activo } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (typeof activo !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser true o false'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_actualizar_estado_tracking',
      inputs: [
        { name: 'user_id', type: sql.Int(), value: userId },
        { name: 'activo', type: sql.Bit(), value: activo }
      ],
      isStoredProcedure: true
    });

    // Notificar a monitores sobre el cambio de estado
    try {
      const evento = activo ? 'chofer:activado' : 'chofer:desactivado';
      emitToMonitores(evento, {
        userId,
        username: (req as any).user?.username,
        activo,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Error al emitir evento Socket.io:', socketError);
    }

    res.status(200).json({
      success: true,
      message: `Tracking ${activo ? 'activado' : 'desactivado'} exitosamente`,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Error en actualizarEstadoTracking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de tracking',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
