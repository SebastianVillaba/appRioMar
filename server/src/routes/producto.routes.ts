import { Router } from "express";
import { finalizarVenta, getProducto } from "../controllers/producto.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getProducto", verifyToken, getProducto);

router.post("/finalizarVenta", verifyToken, finalizarVenta);

export default router;