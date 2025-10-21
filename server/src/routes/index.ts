import { Router } from 'express';
import authRoutes from './auth.routes';
import protectedRoutes from './protected.routes';
import trackingRoutes from './tracking.routes';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/protected', protectedRoutes);
router.use('/tracking', trackingRoutes);

export default router;