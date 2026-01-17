import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

interface Cliente {
    nombre: string;
    apellido: string;
    ruc: string;
    dv: string;
    direccion: string;
    referencia: string;
    fechaAniversario: string;
    celular: string;
    telefono: string;
    email: string;
    idGrupoCliente: number;
    geologalizacion: string;
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
        res.json(result.recordset).status(200);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: "Error al obtener clientes" });
    }
};

export const crearCliente = async (req: Request, res: Response): Promise<void> => {
    try {
        const { idUsuarioAlta, cliente } = req.body as agregarCliente;


        // Formatear fecha de aniversario a formato año-día-mes
        let fechaFormateada = '';
        if (cliente.fechaAniversario) {
            const fecha = new Date(cliente.fechaAniversario);
            if (!isNaN(fecha.getTime())) {
                const year = fecha.getFullYear();
                const day = String(fecha.getDate()).padStart(2, '0');
                const month = String(fecha.getMonth() + 1).padStart(2, '0');
                fechaFormateada = `${day}-${month}-${year}`;
            }
        }

        const result = await executeRequest({
            query: "sp_insPersonaCedula",
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
                    name: "referencia",
                    type: sql.VarChar(200),
                    value: cliente.referencia
                },
                {
                    name: "fechaani",
                    type: sql.VarChar(15),
                    value: fechaFormateada
                },
                {
                    name: "celular1",
                    type: sql.VarChar(20),
                    value: cliente.celular
                },
                {
                    name: "tele1",
                    type: sql.VarChar(20),
                    value: cliente.telefono
                },
                {
                    name: "email1",
                    type: sql.VarChar(50),
                    value: cliente.email
                },
                {
                    name: "facebook",
                    type: sql.VarChar(50),
                    value: ""
                },
                {
                    name: "idGrupoCliente",
                    type: sql.Int(),
                    value: cliente.idGrupoCliente
                },
                {
                    name: "geolocalizacion",
                    type: sql.VarChar(50),
                    value: cliente.geologalizacion
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

export const getGrupoCliente = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await executeRequest({
            query: "select * from [funGrupoClienteActivo] (1)",
            isStoredProcedure: false,
        });
        res.json(result.recordset).status(200);
    } catch (error) {
        console.error("Error al obtener grupos de clientes:", error);
        res.status(500).json({ message: "Error al obtener grupos de clientes" });
    }
}
