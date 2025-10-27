import type { ItemFactura, DatosFactura } from '../types/ticket.types';

/**
 * Utilidades para cálculos de facturas
 */

/**
 * Calcula el IVA 10% de un monto
 */
export function calcularIVA10(montoGravado: number): number {
    return Math.round(montoGravado / 11);
}

/**
 * Calcula el IVA 5% de un monto
 */
export function calcularIVA5(montoGravado: number): number {
    return Math.round(montoGravado / 21);
}

/**
 * Calcula el subtotal de un item
 */
export function calcularSubtotalItem(precio: number, cantidad: number): number {
    return precio * cantidad;
}

/**
 * Calcula los totales de una factura a partir de los items
 */
export function calcularTotalesFactura(items: ItemFactura[]): {
    total: number;
    gravada10: number;
    gravada5: number;
    exenta: number;
    iva10: number;
    iva5: number;
    totalIva: number;
} {
    let gravada10 = 0;
    let gravada5 = 0;
    let exenta = 0;

    items.forEach(item => {
        const subtotal = item.subtotal;
        
        if (item.porcentajeImpuesto === 10) {
            gravada10 += subtotal;
        } else if (item.porcentajeImpuesto === 5) {
            gravada5 += subtotal;
        } else {
            exenta += subtotal;
        }
    });

    const iva10 = calcularIVA10(gravada10);
    const iva5 = calcularIVA5(gravada5);
    const totalIva = iva10 + iva5;
    const total = gravada10 + gravada5 + exenta;

    return {
        total,
        gravada10,
        gravada5,
        exenta,
        iva10,
        iva5,
        totalIva
    };
}

/**
 * Crea un objeto DatosFactura completo con cálculos automáticos
 */
export function crearDatosFactura(
    datosBase: Omit<DatosFactura, 'total' | 'gravada10' | 'gravada5' | 'exenta' | 'iva10' | 'iva5' | 'totalIva'>
): DatosFactura {
    const totales = calcularTotalesFactura(datosBase.items);
    
    return {
        ...datosBase,
        ...totales
    };
}

/**
 * Formatea un número como moneda paraguaya (Guaraníes)
 */
export function formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(monto);
}

/**
 * Formatea un número con separadores de miles
 */
export function formatearNumero(numero: number, decimales: number = 0): string {
    return new Intl.NumberFormat('es-PY', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
    }).format(numero);
}

/**
 * Genera un número de factura en formato estándar
 */
export function generarNumeroFactura(
    sucursal: number,
    caja: number,
    numero: number
): string {
    const sucStr = sucursal.toString().padStart(3, '0');
    const cajaStr = caja.toString().padStart(3, '0');
    const numStr = numero.toString().padStart(7, '0');
    return `${sucStr}-${cajaStr}-${numStr}`;
}
