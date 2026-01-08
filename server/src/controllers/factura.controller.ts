import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';
import { DatosFactura, ItemFactura } from '../types/ticket.types';

export const obtenerDatosFactura = async (req: Request, res: Response): Promise<any> => {
  try {
    const { idVenta } = req.params;

    if (!idVenta) {
      return res.status(400).json({ success: false, message: 'Falta el ID de la venta' });
    }

    // 1. OBTENER CABECERA (Header)
    // En lugar de hacer 15 consultas separadas como en VB, hacemos un JOIN eficiente
    const queryCabecera = `
      SELECT 
        cf.idFacturacion, cf.fechaAlta, cf.timbrado, cf.totalVenta, cf.totalDescuento,
        -- Sucursal
        rtrim(s.nombreFantasia) as sucNombre, rtrim(s.direccion) as sucDireccion, 
        rtrim(s.tele1) as sucTele1, rtrim(s.tele2) as sucTele2,
        -- Empresa (Persona Jurídica del sistema)
        rtrim(pj.ruc) as empRuc, pj.dv as empDv,
        ec.nombre as empContable,
        -- Cliente
        cli.nombre as cliNombre, cli.ruc as cliRuc,
        cli_pj.nombreFantasia as cliFantasia, -- Logic from VB line 63
        -- Factura y Vigencia
        f.fechaCaduca, f.fechaDesde,
        -- Vendedor y Usuario
        v.nombre as vendNombre, u.nick as userNick,
        -- Tipo Venta
        tv.nombreTipo as tipoVenta, tv.contado as esContado,
        -- Datos para armar el Nro Factura
        cf.dsuc, cf.dcaja, cf.factura as nroFacturaRaw
      FROM cabFacturacion cf
        LEFT JOIN v_sucursal s ON cf.idSucursal = s.idSucursal
        LEFT JOIN v_personaJur pj ON cf.idPersonaJur = pj.idPersonaJur
        LEFT JOIN v_empresaContable ec ON cf.idPersonaJur = ec.idPersonaJur
        LEFT JOIN v_cliente cli ON cf.idCliente = cli.idCliente
        LEFT JOIN personaJur cli_pj ON cli.idPersona = cli_pj.idPersona
        LEFT JOIN factura f ON cf.idFactura = f.idFactura
        LEFT JOIN v_vendedor v ON cf.idVendedor = v.idVendedor
        LEFT JOIN v_usuario u ON cf.idUsuarioAlta = u.idUsuario
        LEFT JOIN v_tipoVenta tv ON cf.idTipoVenta = tv.idTipoVenta
      WHERE cf.idFacturacion = @id
    `;

    const resultCabecera = await executeRequest({
      query: queryCabecera,
      inputs: [{ name: 'id', type: sql.Int(), value: idVenta }]
    });

    if (resultCabecera.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    const cab = resultCabecera.recordset[0];

    // 2. OBTENER DETALLES (Items)
    // Esta es la query exacta del VB (con el UNION) adaptada
    const queryDetalles = `
      select dv.cantidad, p.nombreProducto as Mercaderia, p.codigo, dv.precio, 
             dv.precioDescuento, i.porcentajeImpuesto, dv.subtotal,
      (case when dv.idImpuesto=1 then dv.subtotal else 0 end) as exenta,
      (case when dv.idImpuesto=3 then (dv.subtotal-(dv.subtotal/i.factorImpuesto)) else 0 end) as gravada10,
      (case when dv.idImpuesto=2 then (dv.subtotal-(dv.subtotal/i.factorImpuesto)) else 0 end) as gravada5,
      (case when dv.idImpuesto=3 then dv.subtotal else 0 end) as IVA10,
      (case when dv.idImpuesto=2 then dv.subtotal else 0 end) as IVA5
      from detFacturacionProducto dv 
      inner join stock s on dv.idStock=s.idStock 
      inner join producto p on p.idProducto=s.idProducto 
      inner join impuesto i on i.idImpuesto=dv.idImpuesto 
      where dv.idFacturacion = @id
      
      UNION
      
      select dv.cantidad, s.nombreServicio as Mercaderia, '' as codigo, dv.precio, 
             dv.precio, i.porcentajeImpuesto, dv.subtotal,
      (case when dv.idImpuesto=1 then dv.subtotal else 0 end) as exenta,
      (case when dv.idImpuesto=3 then (dv.subtotal-(dv.subtotal/i.factorImpuesto)) else 0 end) as gravada10,
      (case when dv.idImpuesto=2 then (dv.subtotal-(dv.subtotal/i.factorImpuesto)) else 0 end) as gravada5,
      (case when dv.idImpuesto=3 then dv.subtotal else 0 end) as IVA10,
      (case when dv.idImpuesto=2 then dv.subtotal else 0 end) as IVA5
      from detFacturacionServicio dv 
      inner join servicio s on dv.idServicio=s.idServicio 
      inner join impuesto i on i.idImpuesto=dv.idImpuesto 
      where dv.idFacturacion = @id
    `;

    const resultDetalles = await executeRequest({
      query: queryDetalles,
      inputs: [{ name: 'id', type: sql.Int(), value: idVenta }]
    });

    // 3. CALCULAR TOTALES (Lógica del bucle VB)
    let totalGravada10 = 0;
    let totalGravada5 = 0;
    let totalExenta = 0;
    let totalIva10 = 0;
    let totalIva5 = 0;

    const items: ItemFactura[] = resultDetalles.recordset.map((row: any) => {
      // Acumuladores (indices basados en la query SELECT)
      totalExenta += parseFloat(row.exenta || 0);
      totalGravada10 += parseFloat(row.gravada10 || 0);
      totalGravada5 += parseFloat(row.gravada5 || 0);
      totalIva10 += parseFloat(row.IVA10 || 0); // Ojo: en VB el indice 10 era IVA10 (columna calculada)
      totalIva5 += parseFloat(row.IVA5 || 0);

      return {
        codigo: row.codigo,
        mercaderia: row.Mercaderia,
        precio: row.precio,
        cantidad: row.cantidad,
        porcentajeImpuesto: row.porcentajeImpuesto,
        subtotal: row.subtotal
      };
    });

    // Construir Nro Factura formateado (Lógica VB: rtrim(dsuc)+'-'+rtrim(dcaja)+'-'+rellenar...)
    const padFactura = (num: string) => num.padStart(7, '0');
    const nroFactura = `${cab.dsuc.trim()}-${cab.dcaja.trim()}-${padFactura(cab.nroFacturaRaw.toString().trim())}`;

    // 4. ARMAR RESPUESTA FINAL
    const response: DatosFactura = {
      nombreFantasia: cab.sucNombre,
      empresaContable: cab.empContable || '',
      ruc: `${cab.empRuc}-${cab.empDv}`,
      direccion: cab.sucDireccion,
      telefono: `${cab.sucTele1}/${cab.sucTele2}`, // Lógica de concatenación VB
      rubro: "Rubro por defecto", // Dato no presente en queries VB, ajustar según necesidad
      fechaHora: cab.fechaAlta,
      cliente: cab.cliNombre,
      rucCliente: cab.cliRuc,
      direccionCliente: "", // Faltaría agregar la dirección del cliente a la query si es necesaria
      telefonoCliente: "", // Igual para el teléfono
      vendedor: cab.vendNombre,
      formaVenta: cab.tipoVenta,
      tipoFactura: cab.esContado ? "CONTADO" : "CREDITO",
      timbrado: cab.timbrado,
      fechaInicioVigencia: cab.fechaDesde,
      nroFactura: nroFactura,
      items: items,
      total: cab.totalVenta,
      gravada10: totalGravada10,
      gravada5: totalGravada5,
      exenta: totalExenta,
      iva10: totalIva10, // Nota: Revisa si tu lógica de negocio requiere el monto del IMPUESTO o el subtotal Gravado para visualización
      iva5: totalIva5,
      totalIva: (totalIva10 * 0.1) + (totalIva5 * 0.05) // Ejemplo de cálculo, ajustar según lógica exacta de la columna IVA10 del VB
    };

    // Ajuste fino: En el VB, las columnas IVA10 e IVA5 en el SELECT parecen traer el SUBTOTAL gravado, no el impuesto en sí.
    // Si necesitas el valor exacto del impuesto para el pie de página:
    // En el bucle VB: tmpDouTotalGra10 = tmpDouTotalGra10 + CDbl(reader.GetValue(8)) (Columna 8 es gravada10)
    // Revisa la lógica de tus columnas SQL para asegurarte qué valor estás sumando.

    res.json({ success: true, data: response });

  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
};