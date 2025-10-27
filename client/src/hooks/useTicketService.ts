import { useState, useCallback } from 'react';
import ticketService from '../services/ticketService';
import type { DatosFactura } from '../types/ticket.types';

interface UseTicketServiceReturn {
    generarTicket: (datos: DatosFactura) => Promise<void>;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook personalizado para usar el servicio de tickets
 * Proporciona estado de carga y manejo de errores
 */
export function useTicketService(): UseTicketServiceReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const generarTicket = useCallback(async (datos: DatosFactura) => {
        setLoading(true);
        setError(null);
        
        try {
            await ticketService.generarTicket(datos);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido al generar el ticket');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        generarTicket,
        loading,
        error
    };
}
