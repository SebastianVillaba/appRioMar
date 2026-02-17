import { Router } from "express";
import { agregarDetFacturacionTmp_producto, consultaDetFacturacionTmp, finalizarVenta, getProducto, eliminarDetFacturacionTmp_producto, eliminarDetFacturacionTmp_producto_comodato, consultaUltimasVentas, limpiarDetFacturacionTmp_producto, guardarPedidoCliente, consultaPedidosPendientes, pedidoClienteFacturacion } from "../controllers/producto.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getProducto", verifyToken, getProducto);

router.post("/finalizarVenta", verifyToken, finalizarVenta);

router.get("/consultaDetFacturacionTmp", verifyToken, consultaDetFacturacionTmp);

router.post("/agregarDetFacturacionTmp_producto", verifyToken, agregarDetFacturacionTmp_producto);

router.post("/eliminarDetFacturacionTmp_producto", verifyToken, eliminarDetFacturacionTmp_producto);

router.post("/eliminarDetFacturacionTmp_producto_comodato", verifyToken, eliminarDetFacturacionTmp_producto_comodato);

router.post("/limpiarDetFacturacionTmp_producto", verifyToken, limpiarDetFacturacionTmp_producto);

router.get("/consultaUltimasVentas", verifyToken, consultaUltimasVentas);

router.post("/guardarPedidoCliente", verifyToken, guardarPedidoCliente);

router.get("/consultaPedidosPendientes", verifyToken, consultaPedidosPendientes);

router.post("/pedidoClienteFacturacion", verifyToken, pedidoClienteFacturacion);


export default router;