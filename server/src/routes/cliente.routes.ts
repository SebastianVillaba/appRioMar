import { Router } from "express";
import { crearCliente, getCliente, getGrupoCliente } from "../controllers/cliente.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getCliente", verifyToken, getCliente);
router.post("/crearCliente", verifyToken, crearCliente);
router.get("/getGrupoCliente", verifyToken, getGrupoCliente);

export default router;