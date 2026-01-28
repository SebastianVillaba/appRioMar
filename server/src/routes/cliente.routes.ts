import { Router } from "express";
import { crearCliente, getCliente, getGrupoCliente, actualizarPrecioCliente } from "../controllers/cliente.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getCliente", verifyToken, getCliente);
router.post("/crearCliente", verifyToken, crearCliente);
router.get("/getGrupoCliente", verifyToken, getGrupoCliente);
router.post("/actualizarPrecioCliente", verifyToken, actualizarPrecioCliente);

export default router;