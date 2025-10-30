import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";
import { Venta } from "../types/venta.types";

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
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: "Error al obtener productos" });
    }
};

export const finalizarVenta = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            idConfig,
            idPersonaJur,
            idSucursal,
            idCliente,
            idTipoVenta,
            ruc,
            cliente,
            totalVenta,
            totalDescuento,
            idUsuarioAlta,
            timbrado,
            dsuc,
            dcaja,
            facturam,
            idVendedor,
            fecha,
            tipoPrecio,
            imprimir,
            imp,
            unSoloItem
        } = req.body as Venta;

        const result = await executeRequest({
            query: 'sp_guardarVenta',
            isStoredProcedure: true,
            inputs: [
                { name: 'idConfig', type: sql.Int, value: idConfig },
                { name: 'idPersonaJur', type: sql.Int, value: idPersonaJur },
                { name: 'idSucursal', type: sql.Int, value: idSucursal },
                { name: 'idCliente', type: sql.Int, value: idCliente },
                { name: 'idTipoVenta', type: sql.Int, value: idTipoVenta },
                { name: 'ruc', type: sql.VarChar(15), value: ruc },
                { name: 'cliente', type: sql.VarChar(60), value: cliente },
                { name: 'totalVenta', type: sql.Decimal(19, 4), value: totalVenta },
                { name: 'totalDescuento', type: sql.Decimal(19, 4), value: totalDescuento },
                { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta },
                { name: 'timbrado', type: sql.VarChar(20), value: timbrado },
                { name: 'dsuc', type: sql.VarChar(3), value: dsuc },
                { name: 'dcaja', type: sql.VarChar(3), value: dcaja },
                { name: 'facturam', type: sql.VarChar(15), value: facturam },
                { name: 'idVendedor', type: sql.Int, value: idVendedor },
                { name: 'fecha', type: sql.VarChar(15), value: fecha },
                { name: 'tipoPrecio', type: sql.Int, value: tipoPrecio },
                { name: 'imprimir', type: sql.Bit, value: imprimir },
                { name: 'imp', type: sql.Bit, value: imp },
                { name: 'unSoloItem', type: sql.Bit, value: unSoloItem }
            ]
        })
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error al finalizar venta:", error);
        res.status(500).json({ message: "Error al finalizar venta" });
    }
}
