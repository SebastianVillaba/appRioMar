import { Router } from "express";
import { getProducto } from "../controllers/producto.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getProducto", verifyToken, getProducto);

export default router;