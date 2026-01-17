import { Router } from 'express';
import { obtenerDatosFactura, getComodato } from '../controllers/factura.controller';
import { verifyToken } from '../middlewares/auth.middleware'; // Opcional, si requiere login

const router = Router();

// GET /api/factura/imprimir/:idVenta
router.get('/imprimir/:idVenta', verifyToken, obtenerDatosFactura);

// GET /api/factura/comodato/:idFacturacion - Obtener productos de comodato
router.get('/comodato/:idFacturacion', verifyToken, getComodato);

export default router;