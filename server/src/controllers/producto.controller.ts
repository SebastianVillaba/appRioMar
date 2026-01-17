import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";
import { Venta } from "../types/venta.types";
import { getFacturaActual } from "../utils/funciones";
import { exec } from "child_process";

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

        const idDeposito = await executeRequest({
            query: `select idDepositoVenta from configpc where idConfig=3`,
            isStoredProcedure: false
        })

        const idDepositoVenta = idDeposito.recordset[0].idDepositoVenta;

        for (let i = 0; i < result.recordset.length; i++) {
            const idStock = await executeRequest({
                query: `select MIN(s.idStock) as idStock
                        from stock s where idProducto=${result.recordset[i].idProducto} and idDeposito=${idDepositoVenta}
                        and s.cantidad>0`,
                isStoredProcedure: false,
            })
            result.recordset[i].idStock = idStock.recordset[0].idStock;
        }
        console.log(result.recordset);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: "Error al obtener productos" });
    }
};

export const agregarDetFacturacionTmp_producto = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            idConfig,
            idVendedor,
            idItem,
            idStock,
            cantidad,
            tipoPrecio,
            tienePrecio,
            precioNuevo,
            cantidadComodato
        } = req.body;
        const result = await executeRequest({
            query: "sp_agregarDetFacturacionTmp_producto",
            isStoredProcedure: true,
            inputs: [
                {
                    name: "idConfig",
                    type: sql.Int(),
                    value: idConfig
                },
                {
                    name: "idVendedor",
                    type: sql.Int(),
                    value: idVendedor
                },
                {
                    name: "idItem",
                    type: sql.Int(),
                    value: idItem
                },
                {
                    name: "idStock",
                    type: sql.Int(),
                    value: idStock
                },
                {
                    name: "cantidad",
                    type: sql.Decimal(10, 4),
                    value: cantidad
                },
                {
                    name: "tipoPrecio",
                    type: sql.Int(),
                    value: tipoPrecio
                },
                {
                    name: "tienePrecio",
                    type: sql.Bit(),
                    value: tienePrecio
                },
                {
                    name: "precioNuevo",
                    type: sql.Decimal(10, 4),
                    value: precioNuevo
                },
                {
                    name: "cantidadComodato",
                    type: sql.Int(),
                    value: cantidadComodato
                }
            ]
        });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error al agregar producto a la factura:", error);
        res.status(500).json({ message: "Error al agregar producto a la factura" });
    }
};

export const eliminarDetFacturacionTmp_producto = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nro, idVendedor } = req.query;
        const result = await executeRequest({
            query: "delete from detFacturacionTmp where nro=" + nro + " and idVendedor=" + idVendedor + ""
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error("Error al eliminar producto de la factura:", error);
        res.status(500).json({ message: "Error al eliminar producto de la factura" });
    }
}

export const consultaDetFacturacionTmp = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            idConfig,
            idVendedor
        } = req.query;

        const result = await executeRequest({
            query: "sp_consultaDetFacturacionTmp",
            isStoredProcedure: true,
            inputs: [
                {
                    name: "idConfig",
                    type: sql.Int(),
                    value: idConfig
                },
                {
                    name: "idVendedor",
                    type: sql.Int(),
                    value: idVendedor
                }
            ]
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error("Error al consultar detalle de la factura:", error);
        res.status(500).json({ message: "Error al consultar detalle de la factura" });
    }
}

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
            idVendedor,
            fecha,
            tipoPrecio
        } = req.body as Venta;

        const factura = await getFacturaActual(idConfig);
        //console.log(factura);

        const result = await executeRequest({
            query: 'sp_guardarVenta',
            isStoredProcedure: true,
            inputs: [
                // CORRECCIÓN: Agregar () a sql.Int y sql.Bit
                { name: 'idConfig', type: sql.Int(), value: idConfig },
                { name: 'idPersonaJur', type: sql.Int(), value: idPersonaJur },
                { name: 'idSucursal', type: sql.Int(), value: idSucursal },
                { name: 'idCliente', type: sql.Int(), value: idCliente },
                { name: 'idTipoVenta', type: sql.Int(), value: idTipoVenta },
                { name: 'ruc', type: sql.VarChar(15), value: ruc },
                { name: 'cliente', type: sql.VarChar(60), value: cliente },
                { name: 'totalVenta', type: sql.Decimal(19, 4), value: totalVenta },
                { name: 'totalDescuento', type: sql.Decimal(19, 4), value: totalDescuento },
                { name: 'idUsuarioAlta', type: sql.Int(), value: idUsuarioAlta },
                { name: 'timbrado', type: sql.VarChar(20), value: factura.timbrado },
                { name: 'dsuc', type: sql.VarChar(3), value: factura.dsuc },
                { name: 'dcaja', type: sql.VarChar(3), value: factura.dcaja },
                { name: 'facturam', type: sql.VarChar(15), value: '' },
                { name: 'idVendedor', type: sql.Int(), value: idVendedor },
                { name: 'fecha', type: sql.VarChar(15), value: fecha },
                { name: 'tipoPrecio', type: sql.Int(), value: tipoPrecio },
                { name: 'imprimir', type: sql.Bit(), value: 1 },
                { name: 'imp', type: sql.Bit(), value: 1 },
                { name: 'unSoloItem', type: sql.Bit(), value: 0 }
            ]
        })

        // Obtener el idFacturacion de la venta recién creada
        const idFacturacionResult = await executeRequest({
            query: `select MAX(idFacturacion) as idFacturacion from cabFacturacion where idConfig=@idConfig and idVendedor=@idVendedor`,
            isStoredProcedure: false,
            inputs: [
                { name: 'idConfig', type: sql.Int(), value: idConfig },
                { name: 'idVendedor', type: sql.Int(), value: idVendedor }
            ]
        });

        const idFacturacion = idFacturacionResult.recordset[0]?.idFacturacion;

        const tieneComodato = await executeRequest({
            query: `select idFacturacion from detFacturacionComodato where idFacturacion=${idFacturacion}`,
            isStoredProcedure: false
        })

        res.status(200).json({
            success: true,
            idFacturacion: idFacturacion,
            data: result.recordset,
            tieneComodato: tieneComodato.recordset.length > 0
        });
    } catch (error) {
        console.error("Error al finalizar venta:", error);
        res.status(500).json({ success: false, message: "Error al finalizar venta" });
    }
}
