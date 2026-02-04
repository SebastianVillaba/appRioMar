import { Router } from "express";
import { agregarDetFacturacionTmp_producto, consultaDetFacturacionTmp, finalizarVenta, getProducto, eliminarDetFacturacionTmp_producto, eliminarDetFacturacionTmp_producto_comodato, consultaUltimasVentas } from "../controllers/producto.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getProducto", verifyToken, getProducto);

router.post("/finalizarVenta", verifyToken, finalizarVenta);

router.get("/consultaDetFacturacionTmp", verifyToken, consultaDetFacturacionTmp);

router.post("/agregarDetFacturacionTmp_producto", verifyToken, agregarDetFacturacionTmp_producto);

router.post("/eliminarDetFacturacionTmp_producto", verifyToken, eliminarDetFacturacionTmp_producto);

router.post("/eliminarDetFacturacionTmp_producto_comodato", eliminarDetFacturacionTmp_producto_comodato);

router.get("/consultaUltimasVentas", verifyToken, consultaUltimasVentas);

export default router;