import { Router } from 'express';
import { obtenerDatosFactura } from '../controllers/factura.controller';
import { verifyToken } from '../middlewares/auth.middleware'; // Opcional, si requiere login

const router = Router();

// GET /api/factura/imprimir/:idVenta
router.get('/imprimir/:idVenta', verifyToken, obtenerDatosFactura);

export default router;