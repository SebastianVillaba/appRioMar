export interface ItemFactura {
    codigo: number;
    mercaderia: string;
    precio: number;
    cantidad: number;
    porcentajeImpuesto: number;
    subtotal: number;
}

export interface DatosFactura {
    nombreFantasia: string;
    empresaContable: string;
    ruc: string;
    direccion: string;
    telefono: string;
    rubro: string;
    fechaHora: Date;
    cliente: string;
    rucCliente: string;
    direccionCliente: string;
    telefonoCliente: string;
    vendedor: string;
    formaVenta: string;
    tipoFactura: string;
    timbrado: string;
    fechaInicioVigencia: Date;
    nroFactura: string;
    items: ItemFactura[];
    total: number;
    gravada10: number;
    gravada5: number;
    exenta: number;
    iva10: number;
    iva5: number;
    totalIva: number;
}