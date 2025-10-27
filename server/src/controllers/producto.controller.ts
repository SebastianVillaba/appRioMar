import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

export const getProducto = async (req: Request, res: Response): Promise<void> => {
    try {
        const { busqueda } = req.query;
        const result = await executeRequest({
            query: "sp_consultaProducto",
            isStoredProcedure: true,
            inputs: [
                {
                    name: "busqueda",
                    type: sql.VarChar(20),
                    value: busqueda
                }
            ]
        });
        res.json(result.recordset);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: "Error al obtener productos" });
    }
};
