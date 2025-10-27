import { Router } from 'express';
import authRoutes from './auth.routes';
import protectedRoutes from './protected.routes';
import trackingRoutes from './tracking.routes';
import productoRoutes from './producto.routes';
import clienteRoutes from './cliente.routes';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/protected', protectedRoutes);
router.use('/tracking', trackingRoutes);
router.use('/producto', productoRoutes);
router.use('/cliente', clienteRoutes);

export default router;