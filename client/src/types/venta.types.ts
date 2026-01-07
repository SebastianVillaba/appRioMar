export interface Venta {
    idConfig: number;
    idPersonaJur: number;
    idSucursal: number;
    idCliente: number;
    idTipoVenta: number;
    ruc: string;
    cliente: string;
    totalVenta: number;
    totalDescuento: number;
    idUsuarioAlta: number;
    idVendedor: number;
    fecha: string;
    tipoPrecio: number;
}

export interface TipoVenta {
    id: number;
    nombre: string;
}

export interface AgregarTmpDetVenta {
    idConfig: number;
    idVendedor: number;
    idItem: number;
    idStock: number;
    cantidad: number;
    tipoPrecio: number;
    tienePrecio: boolean;
    precioNuevo: number;
    cantidadComodato: number;
}
