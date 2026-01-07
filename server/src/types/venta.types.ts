export interface Venta {
    idConfig: number;
    idPersonaJur: number;
    idSucursal: number;
    idCliente: number;
    idTipoVenta: number;
    ruc: string;
    cliente: string;
    totalVenta: number;
    totalDescuento: number,
    idUsuarioAlta: number;
    timbrado: string;
    dsuc: string;
    dcaja: string;
    facturam: string;
    idVendedor: number;
    fecha: string;
    tipoPrecio: number;
    imprimir: boolean;
    imp: boolean;
    unSoloItem: boolean;
}

export interface agregarTmpDetVenta {
    idConfig: number;
    idVendedor: number;
    idItem: number;
    idStock: number;
    cantidad: number;
    tipoPrecio: number;
    tienePrecio: boolean;
    precioNuevo: number;
    cantidadAcomodato: number;
}