import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Ruta protegida de ejemplo
router.get('/profile', verifyToken, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Perfil del usuario',
    user: req.user,
  });
});

// Otra ruta protegida de ejemplo
router.get('/dashboard', verifyToken, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Dashboard del usuario',
    user: req.user,
  });
});

export default router;
