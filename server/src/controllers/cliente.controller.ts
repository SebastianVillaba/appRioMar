import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

interface Cliente {
    nombre: string;
    apellido: string;
    ruc: string;
    dv: string;
    direccion: string;
    fechaAniversario: string;
    celular: string;
    telefono: string;
    email: string;
    facebook: string;
    idGrupoCliente: number;
}

interface agregarCliente {
    idUsuarioAlta: number;
    cliente: Cliente;
}

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

export const crearCliente = async (req: Request, res: Response): Promise<void> => {
    try {
       const { idUsuarioAlta, cliente } = req.body as agregarCliente;
       const result = await executeRequest({
           query: "sp_agregarCliente",
           isStoredProcedure: true,
           inputs: [
                {
                   name: "idEntidad",
                   type: sql.Int(),
                   value: 1
                },
                {
                   name: "nombre",
                   type: sql.VarChar(40),
                   value: cliente.nombre
                },
                {
                    name: "apellido",
                    type: sql.VarChar(40),
                    value: cliente.apellido
                },
                {
                    name: "ruc",
                    type: sql.VarChar(15),
                    value: cliente.ruc
                },
                {
                    name: "dv",
                    type: sql.VarChar(1),
                    value: cliente.dv
                },
                {
                    name: "direccion",
                    type: sql.VarChar(100),
                    value: cliente.direccion
                },
                {
                    name: "fechaani",
                    type: sql.VarChar(15),
                    value: cliente.fechaAniversario
                },
                {
                    name: "celular",
                    type: sql.VarChar(20),
                    value: cliente.celular
                },
                {
                    name: "telefono",
                    type: sql.VarChar(20),
                    value: cliente.telefono
                },
                {
                    name: "email",
                    type: sql.VarChar(50),
                    value: cliente.email
                },
                {
                    name: "facebook",
                    type: sql.VarChar(50),
                    value: cliente.facebook
                },
                {
                    name: "idGrupoCliente",
                    type: sql.Int(),
                    value: cliente.idGrupoCliente
                },
                {
                    name: "idUsuarioAlta",
                    type: sql.Int(),
                    value: idUsuarioAlta
                }
           ]
       });
       res.json(result.recordset).status(200);
    } catch (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({ message: "Error al crear cliente" });
    }
}
