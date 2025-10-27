/**
 * Exportaciones centralizadas de servicios
 */

// Servicio de tickets
export { default as ticketService } from './ticketService';

// Tipos
export type { ItemFactura, DatosFactura } from '../types/ticket.types';

// Utilidades de cálculo
export {
    calcularIVA10,
    calcularIVA5,
    calcularSubtotalItem,
    calcularTotalesFactura,
    crearDatosFactura,
    formatearMoneda,
    formatearNumero,
    generarNumeroFactura
} from '../utils/facturaCalculos';

// Hook personalizado
export { useTicketService } from '../hooks/useTicketService';

// Componentes
export { default as ImprimirFacturaButton } from '../components/ImprimirFacturaButton';
