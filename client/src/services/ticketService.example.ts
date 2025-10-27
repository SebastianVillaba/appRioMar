import ticketService from './ticketService';
import type { DatosFactura, ItemFactura } from '../types/ticket.types';
import { crearDatosFactura, generarNumeroFactura } from '../utils/facturaCalculos';

/**
 * Ejemplo de uso del TicketService
 * Este archivo muestra cómo generar un ticket de factura
 */

// Primero definimos los items
const itemsEjemplo: ItemFactura[] = [
    {
        codigo: 1001,
        mercaderia: "Producto A - Descripción del producto",
        precio: 50000,
        cantidad: 2,
        porcentajeImpuesto: 10,
        subtotal: 100000
    },
    {
        codigo: 1002,
        mercaderia: "Producto B",
        precio: 30000,
        cantidad: 1,
        porcentajeImpuesto: 5,
        subtotal: 30000
    },
    {
        codigo: 1003,
        mercaderia: "Producto C - Exento",
        precio: 20000,
        cantidad: 3,
        porcentajeImpuesto: 0,
        subtotal: 60000
    }
];

// Usamos la función crearDatosFactura para calcular automáticamente los totales
const datosEjemplo: DatosFactura = crearDatosFactura({
    // Datos de la empresa
    nombreFantasia: "Mi Empresa S.A.",
    empresaContable: "Empresa Contable Ejemplo",
    ruc: "80012345-6",
    direccion: "Av. Principal 1234, Asunción",
    telefono: "021-123456",
    rubro: "Comercio al por menor",

    // Datos de la venta
    fechaHora: new Date(),
    cliente: "Cliente Ejemplo S.R.L.",
    rucCliente: "80098765-4",
    direccionCliente: "Calle Secundaria 567, Asunción",
    telefonoCliente: "021-654321",
    vendedor: "Juan Pérez",
    formaVenta: "Contado",
    tipoFactura: "Contado",
    timbrado: "12345678",
    fechaInicioVigencia: new Date("2024-01-01"),
    nroFactura: generarNumeroFactura(1, 1, 123),

    // Items de la factura (los totales se calculan automáticamente)
    items: itemsEjemplo
});

/**
 * Función para generar el ticket
 * Llamar esta función cuando se necesite imprimir una factura
 */
export async function generarTicketEjemplo() {
    try {
        await ticketService.generarTicket(datosEjemplo);
        console.log('Ticket generado exitosamente');
    } catch (error) {
        console.error('Error al generar el ticket:', error);
    }
}

// Para usar en un componente React:
// import { generarTicketEjemplo } from './services/ticketService.example';
// 
// const handleImprimirFactura = async () => {
//     await generarTicketEjemplo();
// };
