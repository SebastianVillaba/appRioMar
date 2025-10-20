import { Router } from 'express';
import authRoutes from './auth.routes';
import protectedRoutes from './protected.routes';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/protected', protectedRoutes);

export default router;