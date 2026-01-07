import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { executeRequest, sql } from "../utils/dbHandler";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Nombre de usuario y contraseña son obligatorios!" });
    return;
  }

  try {
    const result = await executeRequest({
      query: "sp_usuarioPassWeb",
      isStoredProcedure: true,
      inputs: [
        {
          name: 'usuario',
          type: sql.VarChar(20),
          value: username
        },
        {
          name: 'pass',
          type: sql.VarChar(20),
          value: password
        }
      ]
    });

    const { resultado, idUsuario } = result.recordset[0];

    if (resultado === 1) {
      res.status(401).json({ message: "Usuario no encontrado" });
      return;
    } else if (resultado === 2) {
      res.status(401).json({ message: "Contraseña incorrecta" });
      return;
    } else if (resultado === 3) {
      const vendedor = await executeRequest({
        query: `select [dbo].[funObtenerIdVendedor] (${result.recordset[0].idUsuario}) as idVendedor`
      })

      const vendedorNombre = await executeRequest({
        query: `select [dbo].[funObtenerNombreVendedor] (${vendedor.recordset[0].idVendedor}) as nombreVendedor`
      })
      const idSucursal = await executeRequest({
        query: `select idSucursal from configpc where idConfig=3`,
        isStoredProcedure: false
      })
      const idPersonaJur = await executeRequest({
        query: `select idPersonaJur from configpc where idConfig=3`,
        isStoredProcedure: false
      })
      const idFactura = await executeRequest({
        query: `select idFactura from configpc where idConfig=3`,
        isStoredProcedure: false
      })
      const dsuc = await executeRequest({
        query: `select dsuc from factura where idFactura=${idFactura.recordset[0].idFactura}`,
        isStoredProcedure: false
      })
      const dcaja = await executeRequest({
        query: `select dcaja from factura where idFactura=${idFactura.recordset[0].idFactura}`,
        isStoredProcedure: false
      })
      const factura = await executeRequest({
        query: `select nroFacturaSgte as factura from factura where idFactura=${idFactura.recordset[0].idFactura}`,
        isStoredProcedure: false
      })

      // constante que da la informacion al client con el idCobrador tambien
      const resultFinal = {
        ...result.recordset[0],
        idVendedor: vendedor.recordset[0].idVendedor,
        nombreVendedor: vendedorNombre.recordset[0].nombreVendedor,
        idSucursal: idSucursal.recordset[0].idSucursal,
        idPersonaJur: idPersonaJur.recordset[0].idPersonaJur,
        dsuc: dsuc.recordset[0].dsuc,
        dcaja: dcaja.recordset[0].dcaja,
        factura: factura.recordset[0].factura
      }

      const token = jwt.sign(
        resultFinal,
        process.env.JWT_SECRET || "andate a la puta",
        { expiresIn: "30m" }
      );



      res.json({
        message: "Login exitoso",
        token,
        user: {
          id: idUsuario
        },
        vendedor: {
          idUsuario: resultFinal.idUsuario,
          idVendedor: resultFinal.idVendedor,
          nombreVendedor: resultFinal.nombreVendedor,
          idSucursal: resultFinal.idSucursal,
          idPersonaJur: resultFinal.idPersonaJur,
          dsuc: resultFinal.dsuc,
          dcaja: resultFinal.dcaja,
          factura: resultFinal.factura
        },
        success: true
      });
    } else {
      res.status(500).json({ message: "Error desconocido en autenticación" });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};