import { Router } from "express";
import { getCliente } from "../controllers/cliente.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getCliente", verifyToken, getCliente);

export default router;