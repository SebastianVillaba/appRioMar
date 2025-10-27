import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ticketService from '../services/ticketService';
import type { DatosFactura } from '../types/ticket.types';

interface ImprimirFacturaButtonProps {
    datosFactura: DatosFactura;
    disabled?: boolean;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

/**
 * Componente botón para imprimir facturas
 * Utiliza el TicketService para generar el PDF de la factura
 */
export default function ImprimirFacturaButton({
    datosFactura,
    disabled = false,
    variant = 'contained',
    color = 'primary'
}: ImprimirFacturaButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleImprimir = async () => {
        setLoading(true);
        try {
            await ticketService.generarTicket(datosFactura);
            console.log('Factura generada exitosamente');
        } catch (error) {
            console.error('Error al generar la factura:', error);
            alert('Error al generar la factura. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            color={color}
            onClick={handleImprimir}
            disabled={disabled || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PrintIcon />}
        >
            {loading ? 'Generando...' : 'Imprimir Factura'}
        </Button>
    );
}
