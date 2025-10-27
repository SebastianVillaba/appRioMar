import { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useTicketService } from '../hooks/useTicketService';
import { crearDatosFactura, generarNumeroFactura, formatearMoneda } from '../utils/facturaCalculos';
import type { ItemFactura } from '../types/ticket.types';

/**
 * Ejemplo completo de integración del servicio de tickets
 * Este componente muestra cómo:
 * 1. Crear datos de factura con cálculos automáticos
 * 2. Usar el hook useTicketService
 * 3. Manejar estados de carga y errores
 * 4. Imprimir la factura
 */
export default function FacturaCompleteExample() {
    const { generarTicket, loading, error } = useTicketService();
    const [success, setSuccess] = useState(false);

    // Datos de ejemplo
    const items: ItemFactura[] = [
        {
            codigo: 1001,
            mercaderia: "Laptop HP 15.6\" Core i5",
            precio: 3500000,
            cantidad: 1,
            porcentajeImpuesto: 10,
            subtotal: 3500000
        },
        {
            codigo: 1002,
            mercaderia: "Mouse Inalámbrico Logitech",
            precio: 150000,
            cantidad: 2,
            porcentajeImpuesto: 10,
            subtotal: 300000
        },
        {
            codigo: 1003,
            mercaderia: "Cable HDMI 2m",
            precio: 50000,
            cantidad: 1,
            porcentajeImpuesto: 5,
            subtotal: 50000
        }
    ];

    // Crear datos de factura con cálculos automáticos
    const datosFactura = crearDatosFactura({
        // Datos de la empresa
        nombreFantasia: "TechStore Paraguay",
        empresaContable: "TechStore S.A.",
        ruc: "80012345-6",
        direccion: "Av. Mariscal López 1234, Asunción",
        telefono: "021-555-1234",
        rubro: "Venta de equipos informáticos",

        // Datos de la venta
        fechaHora: new Date(),
        cliente: "Juan Pérez González",
        rucCliente: "4567890-1",
        direccionCliente: "Calle España 567, Fernando de la Mora",
        telefonoCliente: "0981-123456",
        vendedor: "María González",
        formaVenta: "Contado",
        tipoFactura: "Contado",
        timbrado: "15789456",
        fechaInicioVigencia: new Date("2024-01-01"),
        nroFactura: generarNumeroFactura(1, 1, 456),

        // Items
        items: items
    });

    const handleImprimir = async () => {
        setSuccess(false);
        try {
            await generarTicket(datosFactura);
            setSuccess(true);
            
            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error al imprimir:', err);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Ejemplo de Factura
            </Typography>

            <Card sx={{ marginBottom: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Información de la Venta
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Cliente:</strong> {datosFactura.cliente}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>RUC:</strong> {datosFactura.rucCliente}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Vendedor:</strong> {datosFactura.vendedor}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Nro. Factura:</strong> {datosFactura.nroFactura}
                    </Typography>

                    <Box sx={{ marginTop: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Items:
                        </Typography>
                        {items.map((item, index) => (
                            <Typography key={index} variant="body2" color="text.secondary">
                                • {item.mercaderia} - {formatearMoneda(item.subtotal)}
                            </Typography>
                        ))}
                    </Box>

                    <Box sx={{ marginTop: 2, paddingTop: 2, borderTop: '1px solid #ddd' }}>
                        <Typography variant="h6">
                            Total: {formatearMoneda(datosFactura.total)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            IVA 10%: {formatearMoneda(datosFactura.iva10)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            IVA 5%: {formatearMoneda(datosFactura.iva5)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total IVA: {formatearMoneda(datosFactura.totalIva)}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    Error al generar la factura: {error.message}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ marginBottom: 2 }}>
                    Factura generada exitosamente
                </Alert>
            )}

            <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleImprimir}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PrintIcon />}
            >
                {loading ? 'Generando Factura...' : 'Imprimir Factura'}
            </Button>

            <Box sx={{ marginTop: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    Al hacer clic en "Imprimir Factura", se generará un PDF optimizado 
                    para impresoras térmicas de 50mm y se abrirá automáticamente el 
                    diálogo de impresión.
                </Typography>
            </Box>
        </Box>
    );
}
