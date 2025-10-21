import { Router } from 'express';
import {
  guardarUbicacion,
  obtenerUbicacionesActivas,
  obtenerHistorialUsuario,
  actualizarEstadoTracking
} from '../controllers/tracking.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/tracking/ubicacion
 * @desc    Guardar nueva ubicación del usuario autenticado
 * @access  Privado (requiere token JWT)
 * @body    { lat: number, lng: number, velocidad?: number, precision?: number }
 */
router.post('/ubicacion', verifyToken, guardarUbicacion);

/**
 * @route   GET /api/tracking/activos
 * @desc    Obtener lista de usuarios con tracking activo y su última ubicación
 * @access  Privado (requiere token JWT)
 */
router.get('/activos', verifyToken, obtenerUbicacionesActivas);

/**
 * @route   GET /api/tracking/historial/:userId
 * @desc    Obtener historial de ubicaciones de un usuario específico
 * @access  Privado (requiere token JWT)
 * @params  userId - ID del usuario
 * @query   fechaInicio?: string, fechaFin?: string, limite?: number
 */
router.get('/historial/:userId', verifyToken, obtenerHistorialUsuario);

/**
 * @route   PUT /api/tracking/estado
 * @desc    Activar o desactivar tracking del usuario autenticado
 * @access  Privado (requiere token JWT)
 * @body    { activo: boolean }
 */
router.put('/estado', verifyToken, actualizarEstadoTracking);

export default router;
