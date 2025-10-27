import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

export const getCliente = async (req: Request, res: Response): Promise<void> => {
    try {
        const { busqueda } = req.query;
        const result = await executeRequest({
            query: "sp_consultaCliente",
            isStoredProcedure: true,
            inputs: [
                {
                    name: "busqueda",
                    type: sql.VarChar(50),
                    value: busqueda
                }
            ]
        });
        res.json(result.recordset);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: "Error al obtener clientes" });
    }
};
